using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Pipes;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CpzTrader.Models;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SubscriptionValidationResponse = Microsoft.Azure.WebJobs.Extensions.EventGrid.SubscriptionValidationResponse;

namespace CpzTrader
{
    public static class Trader
    {
        /// <summary>
        /// трейдер-оркестратор, обрабатывает торговую логику отдельного клиента
        /// </summary>
        [FunctionName("Trader")]
        public static async Task RunOrchestrator(
            [OrchestrationTrigger] DurableOrchestrationContext context)
        {
            try
            {
                // получаем данные о клиенте аккаунт которого будем обрабатывать
                var clientInfo = context.GetInput<Client>();

                // ждем дальнейших указаний
                var newSignal = await context.WaitForExternalEvent<NewSignal>("NewSignal");

                if (!clientInfo.IsEmulation)
                {
                    // реальная торговля

                    // выполняем бизнес логику согласно данным из сигнала
                    //await context.CallActivityAsync<NewSignal>("Trader_Buy", newSignal);

                    using (HttpClient httpClient = new HttpClient())
                    {
                        var url = "http://localhost:7077/api/HttpTriggerJS";
                        var resl = await httpClient.PostAsJsonAsync(url, newSignal);

                    }
                }
                else // эмуляция торговли
                {                    
                    var action = newSignal.Action;

                    if (action == ActionType.Opening)
                    {
                        Position newPosition = new Position();

                        var openOrder = Emulator.SendOrder(newSignal, clientInfo);

                        newPosition.OpenOrders.Add(openOrder);

                        newPosition.State = newSignal.Type == OrderType.Limit ? PositionState.Opening : PositionState.Open;

                        clientInfo.AllPositions.Add(newPosition);
                    }
                    else if(action == ActionType.Open)
                    {
                        var needPosition = clientInfo.AllPositions[clientInfo.AllPositions.Count - 1];

                        var needOrder = needPosition.GetNeedOpenOrder(newSignal.NumberOrderInRobot);

                        if(needOrder != null)
                        {
                            needOrder.State = OrderState.Done;
                        }

                        needPosition.State = PositionState.Open;

                    }
                    else if (action == ActionType.Closing)
                    {
                        var needPosition = clientInfo.AllPositions[clientInfo.AllPositions.Count - 1];

                        var closeOrder = Emulator.SendOrder(newSignal, clientInfo);

                        needPosition.CloseOrders.Add(closeOrder);

                        needPosition.State = newSignal.Type == OrderType.Limit ? PositionState.Closing : PositionState.Close;
                    }
                    else if(action == ActionType.Close)
                    {
                        var needPosition = clientInfo.AllPositions[clientInfo.AllPositions.Count - 1];

                        var needOrder = needPosition.GetNeedOpenOrder(newSignal.NumberOrderInRobot);

                        if (needOrder != null)
                        {
                            needOrder.State = OrderState.Done;
                        }

                        needPosition.State = PositionState.Close;
                    }                    
                }

                // обновляем информацию о клиенте в базе
                await UpdateClientInfoAsync(clientInfo);

                // переходим на следующую итерацию, передавая себе текущее состояние
                context.ContinueAsNew(clientInfo);

            }
            catch (Exception e)
            {
                await SendLogMessageAsync(e.Message);
                throw;
            }
        }

        /// <summary>
        /// обработчик событий пришедших от советника
        /// </summary>
        [FunctionName("Trader_HttpStart")]
        public static async Task<HttpResponseMessage> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")]HttpRequestMessage req,
            [OrchestrationClient]DurableOrchestrationClient starter,
            TraceWriter log)
        {
            try
            {
                // событие валидации подписки
                const string subscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";

                // событие запуска проторговщиков
                const string cpzTasksTraderStart = "CPZ.Tasks.Trader.Start";

                // событие появления нового сигнала
                const string cpzSignalsNewSignal = "CPZ.Signals.NewSignal";


                string requestContent = await req.Content.ReadAsStringAsync();

                EventGridEvent[] eventGridEvents = JsonConvert.DeserializeObject<EventGridEvent[]>(requestContent);

                foreach (EventGridEvent eventGridEvent in eventGridEvents)
                {
                    JObject dataObject = eventGridEvent.Data as JObject;

                    // В зависимости от типа события выполняем определенную логику
                    // валидация
                    if (string.Equals(eventGridEvent.EventType, subscriptionValidationEvent, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<SubscriptionValidationEventData>();
                        
                        var responseData = new SubscriptionValidationResponse();

                        responseData.ValidationResponse = eventData.ValidationCode;

                        Debug.WriteLine("Событие валидации обработано!");
                        
                        return new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent(JsonConvert.SerializeObject(responseData))
                        };
                    }
                    // запуск проторговщиков
                    else if (string.Equals(eventGridEvent.EventType, cpzTasksTraderStart, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<StartNewTraderData>();

                        List<Client> clients = GetClientsInfo(eventData.AdvisorName);

                        // для каждого клиента запускаем своего проторговщика и сохраняем его идентификатор у клиента
                        foreach (var client in clients)
                        {
                            string traderTask = await starter.StartNewAsync("Trader", client);

                            client.TraderId = traderTask;                            
                        }

                        // сохраняем обновленных клиентов в таблицу
                        await SaveClientsInfoDbAsync(clients);                      

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                    // новый сигнал
                    else if (string.Equals(eventGridEvent.EventType, cpzSignalsNewSignal, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<NewSignal>();

                        // получаем из базы клиентов с айдишниками трейдеров
                        TableQuerySegment<Client> clients = await GetClientsInfoFromDbAsync(eventData.AdvisorName);

                        List<Task> parallelSignals = new List<Task>();

                        if(clients != null)
                        {
                            // асинхронно отправляем сигнал всем проторговщикам
                            foreach (Client client in clients)
                            {
                                var parallelSignal = starter.RaiseEventAsync(client.TraderId, "NewSignal", eventData);

                                parallelSignals.Add(parallelSignal);
                            }

                            await Task.WhenAll(parallelSignals);
                        }
                        
                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }                    
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                await SendLogMessageAsync(e.Message);
                throw;
            }            
        }

        #region Работа с базой данных

        /// <summary>
        /// инициализирует тестовых клиентов
        /// </summary>
        /// <param name="advisorName">имя советника</param>
        private static List<Client> GetClientsInfo(string advisorName)
        {
            List<Client> _clients = new List<Client>();

            for (int i = 0; i < 1; i++)
            {
                _clients.Add(new Client(i.ToString(), advisorName)
                {
                    //UniqId = i.ToString(),
                    //AdvisorName = advisorName,
                    PublicKey = "pubKey"+ i,
                    PrivateKey = "prKey" + i
                });               
            }
            return _clients;
        }

        /// <summary>
        /// сохранить информацию о клиентах в базе
        /// </summary>
        /// <param name="clients">список клиентов</param>
        private static async Task SaveClientsInfoDbAsync<T>(List<T> clients)  where T: ITableEntity
        {
            try
            {
                // подключаемся к локальному хранилищу
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

                // создаем объект для работы с таблицами
                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                // получаем нужную таблицу
                var table = cloudTableClient.GetTableReference("clientsinfo");

                // если она еще не существует - создаем
                var res = table.CreateIfNotExistsAsync().Result;

                TableBatchOperation batchOperation = new TableBatchOperation();

                // сохраняем пачкой элементы в таблице
                foreach (var client in clients)
                {
                    batchOperation.Insert(client);
                }

                await table.ExecuteBatchAsync(batchOperation);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// получить из базы клиентов по имени советника
        /// </summary>
        /// <param name="advisorName"></param>
        /// <returns></returns>
        private static async Task<TableQuerySegment<Client>> GetClientsInfoFromDbAsync(string advisorName)
        {
            try
            {
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                var table = cloudTableClient.GetTableReference("clientsinfo");

                // формируем фильтр, чтобы получить клиентов для нужного робота
                var query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

                TableQuerySegment<Client> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                return result;

            }
            catch(StorageException e)
            {
                Debug.WriteLine(e);
                return null;
            }

            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// обновить запись о клиенте в базе
        /// </summary>
        private static async Task<bool> UpdateClientInfoAsync(Client client)
        {


            return false;
        }

        #endregion

        #region логирование

        /// <summary>
        /// отправляет сообщения в лог
        /// </summary>
        public static async Task SendLogMessageAsync(string message)
        {
            await Task.Run(async () =>
            {
                Debug.WriteLine(message);
                await Task.Delay(1);
            });
        }
        #endregion
    }
}