using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Pipes;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using CpzTrader.Models;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SubscriptionValidationResponse = Microsoft.Azure.WebJobs.Extensions.EventGrid.SubscriptionValidationResponse;

namespace CpzTrader
{
    public static class Trader
    {
        public static HttpClient httpClient = new HttpClient();

        /// <summary>
        /// отправить ордер на биржу
        /// </summary>        
        public static async Task<Order> SendOrder(Client clientInfo, NewSignal signal)
        {
            (Client client, NewSignal newSignal) tradeInfo = (clientInfo, signal);                

            var url = "http://localhost:7077/api/HttpTriggerJS/SetOrder";

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");            

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                Order newOrder = JsonConvert.DeserializeObject<Order>(operationResult);

                if (newOrder.State == OrderState.Open)
                {
                    return newOrder;
                }
            }
            else if (status == HttpStatusCode.InternalServerError)
            {
                (int code, string message) errorInfo = JsonConvert.DeserializeObject<(int, string)>(operationResult);

                // отправить сообщение об ошибке в лог
                if (errorInfo.code == 100)
                {
                    // ошибка идентификации пользователя на бирже
                }
                else if (errorInfo.code == 110)
                {
                    // Не достаточно средств для выставления ордера
                }
                else if (errorInfo.code == 120)
                {
                    // Ошибка в параметрах ордера
                }
            }
            return null;
        }

        /// <summary>
        /// отменить ордер
        /// </summary>        
        public static async Task<bool> CancelOrder(string orderNumber, Client clientInfo, NewSignal signal)
        {
            (string numberOrder, Client client, NewSignal signal) tradeInfo = (orderNumber, clientInfo, signal);

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var url = "http://localhost:7077/api/HttpTriggerJS/CancelOrder";

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                var canceledOrder = JsonConvert.DeserializeObject<Order>(operationResult);

                if (canceledOrder.State == OrderState.Canceled)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else if(status == HttpStatusCode.InternalServerError)
            {
                (int code, string message) errorInfo = JsonConvert.DeserializeObject<(int, string)>(operationResult);

                // отправить сообщение об ошибке в лог
                if (errorInfo.code == 400)
                {
                    // Ошибка снятия, ордер уже отменен или исполнен

                }
                else if(errorInfo.code == 410)
                {
                    // Не удалось отменить ордер, ошибка сети
                }
            }
            return false;
        }

        /// <summary>
        /// проверить статус ордера
        /// </summary>        
        public static async Task<bool> CheckOrderStatus(string orderNumber, Client clientInfo, NewSignal signal)
        {
            (string numberOrder, Client client, NewSignal signal) tradeInfo = (orderNumber, clientInfo, signal);

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var url = "http://localhost:7077/api/HttpTriggerJS/CheckOrder";

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                Order orderInfo = JsonConvert.DeserializeObject<Order>(operationResult);

                if(orderInfo.Volume == orderInfo.Executed)
                {
                    return true;
                }
                return false;
            }
            else
            {
                return false;
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
                    // инициализация тестовых клиентов
                    else if (string.Equals(eventGridEvent.EventType, cpzTasksTraderStart, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<StartNewTraderData>();

                        List<Client> clients = GetClientsInfo(eventData.AdvisorName);                        

                        // сохраняем обновленных клиентов в таблицу
                        await SaveClientsInfoDbAsync(clients);                      

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                    // новый сигнал                    
                    else if (string.Equals(eventGridEvent.EventType, cpzSignalsNewSignal, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<NewSignal>();

                        // получаем из базы клиентов с текущими настройками
                        List<Client> clients = await GetClientsInfoFromDbAsync(eventData.AdvisorName);

                        List<Task> parallelTraders = new List<Task>();

                        if (clients != null)
                        {
                            // асинхронно отправляем сигнал всем проторговщикам
                            foreach (Client client in clients)
                            {
                                var parallelTrader = RunTrader(client, eventData);

                                parallelTraders.Add(parallelTrader);
                            }

                            await Task.WhenAll(parallelTraders);
                        }

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
                throw;
            }            
        }

        /// <summary>
        /// опубликовать событие в event grid
        /// </summary>        
        public static async Task PublishEvent(string eventType,Order order)
        {
            try
            {
                string _topicEndpoint = Environment.GetEnvironmentVariable("EgTopicEndpoint");

                var _topicHostname = new Uri(_topicEndpoint).Host;

                string _topicKey = Environment.GetEnvironmentVariable("EgTopicKey");

                var topicCredentials = new TopicCredentials(_topicKey);

                EventGridClient eventGridClient = new EventGridClient(topicCredentials);

                List<EventGridEvent> eventsList = new List<EventGridEvent>();

                for (int i = 0; i < 1; i++)
                {
                    // Формируем данные
                    dynamic data = new JObject();
                    data.number = order.NumberInRobot;
                    data.symbol = order.Symbol;
                    data.time = order.Time;

                    // Создаем новое событие
                    eventsList.Add(new EventGridEvent()
                    {
                        Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                        Subject = $"Ордер номер : {order.NumberInRobot} # бумага : {order.Symbol} # создан : {order.Time}", // тема события
                        DataVersion = "1.0", // версия данных
                        EventType = eventType, // тип события
                        Data = data, // данные события
                        EventTime = DateTime.Now // время формирования события
                    });
                }

                // Отправка событий в тему
                await eventGridClient.PublishEventsAsync(_topicHostname, eventsList);

            }
            catch(Exception error)
            {
                Debug.WriteLine(error);
            }
        }

        /// <summary>
        /// клиентский проторговщик
        /// </summary>
        /// <param name="clientInfo">данные о клиенте, для которого обрабатывается сигнал</param>
        /// <param name="newSignal">сигнал</param>
        public static async Task RunTrader(Client clientInfo, NewSignal newSignal)
        {
            var action = newSignal.Action;

            bool canOpen = true;
            
            // если сигнал на открытие нового ордера, проверяем достаточно ли средств на балансе
            //if (action == ActionType.NewOpenOrder || action == ActionType.NewPosition)
            //{
            //    canOpen = Emulator.CheckBalance(clientInfo.EmulatorSettings.CurrentBalance, newSignal.Price, clientInfo.TradeSettings.Volume);
            //}

            // находим позицию для которой пришел сигнал
            var needPosition = clientInfo.AllPositions.Find(position => position.NumberPositionInRobot == newSignal.NumberPositionInRobot);

            // если сигнал на открытие новой позиции
            if (action == ActionType.NewPosition && canOpen)
            {
                // создаем ее
                Position newPosition = new Position();

                newPosition.NumberPositionInRobot = newSignal.NumberPositionInRobot;

                // добавляем в нее новый открывающий ордер
                var openOrder = clientInfo.IsEmulation ? Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal)
                                                           : await SendOrder(clientInfo, newSignal);

                await PublishEvent("CPZ.Trader.NewOpenOrder", openOrder);
                                                       
                if (openOrder != null)
                {
                    newPosition.OpenOrders.Add(openOrder);

                    // сохраняем позицию в клиенте
                    clientInfo.AllPositions.Add(newPosition);
                }
            }
            if(needPosition != null)
            {
                // наращиваем объем позиции
                if (action == ActionType.NewOpenOrder && canOpen)
                {
                    var openOrder = clientInfo.IsEmulation ? Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal)
                                                           : await SendOrder(clientInfo, newSignal);

                    await PublishEvent("CPZ.Trader.NewOpenOrder", openOrder);

                    if (openOrder != null)
                    {
                        needPosition.OpenOrders.Add(openOrder);
                    }

                } // сокращаем объем позиции
                else if (action == ActionType.NewCloseOrder)
                {
                    var needCloseVolume = needPosition.GetOpenVolume() * newSignal.PercentVolume / 100;

                    var closeOrder = Emulator.SendOrder(needCloseVolume, newSignal);

                    await PublishEvent("CPZ.Trader.NewCloseOrder", closeOrder);

                    if (closeOrder != null)
                    {
                        needPosition.CloseOrders.Add(closeOrder);
                    }

                    if (newSignal.PercentVolume == 100)
                    {
                        var totals = needPosition.CalculatePositionResult();
                        clientInfo.EmulatorSettings.CurrentBalance += totals;
                    }

                } // проверить состояние ордера
                else if (action == ActionType.CheckOrder)
                {
                    var needOrder = needPosition.GetNeedOrder(newSignal.NumberOrderInRobot);

                    if (needOrder != null)
                    {
                        if (clientInfo.IsEmulation)
                        {
                            needOrder.State = OrderState.Closed;
                        }
                        else
                        {
                            var resultChecking = await CheckOrderStatus(needOrder.NumberInSystem, clientInfo, newSignal);

                            needOrder.State = resultChecking ? OrderState.Closed : OrderState.Open;
                        }
                    }

                } // отозвать ордер
                else if (action == ActionType.CancelOrder)
                {
                    var needOrder = needPosition.GetNeedOrder(newSignal.NumberOrderInRobot);

                    if (needOrder != null)
                    {
                        if (clientInfo.IsEmulation)
                        {
                            needOrder.State = OrderState.Canceled;
                        }
                        else
                        {
                            var cancellationResult = await CancelOrder(needOrder.NumberInSystem, clientInfo, newSignal);
                        }
                    }
                }
            }

            await UpdateClientInfoAsync(clientInfo);
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
                    TradeSettings = new TradeSettings()
                    {
                        PublicKey = i == 0 ? "111" : "pubKey" + i,
                        PrivateKey = i == 0 ? "222" : "pubKey" + i,
                        Volume = i + 12,
                    },
                    EmulatorSettings = new EmulatorSettings()
                    {
                        Slippage = 10 + i,
                        StartingBalance = 10000 + i * 300,
                        CurrentBalance = 10000 + i * 300,
                    },
                    
                    IsEmulation = false,                    
                });               
            }
            return _clients;
        }

        /// <summary>
        /// сохранить информацию о клиентах в базе
        /// </summary>
        /// <param name="clients">список клиентов</param>
        private static async Task SaveClientsInfoDbAsync(List<Client> clients)
        {
            try
            {
                var appParameter = "AzureWebJobsStorage";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                // подключаемся к локальному хранилищу
                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

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
                    client.AllPositionsJson = JsonConvert.SerializeObject(client.AllPositions);

                    client.TradeSettingsJson = JsonConvert.SerializeObject(client.TradeSettings);

                    client.EmulatorSettingsJson = JsonConvert.SerializeObject(client.EmulatorSettings);

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
        /// <param name="advisorName">имя советника</param>
        /// <returns></returns>
        private static async Task<List<Client>> GetClientsInfoFromDbAsync(string advisorName)
        {
            try
            {
                var appParameter = "AzureWebJobsStorage";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                var table = cloudTableClient.GetTableReference("clientsinfo");

                // формируем фильтр, чтобы получить клиентов для нужного робота
                var query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

                TableQuerySegment<Client> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                List<Client> clients = new List<Client>();

                foreach(var client in result)
                {
                    client.AllPositions = JsonConvert.DeserializeObject<List<Position>>(client.AllPositionsJson);

                    client.TradeSettings = JsonConvert.DeserializeObject<TradeSettings>(client.TradeSettingsJson);

                    client.EmulatorSettings = JsonConvert.DeserializeObject<EmulatorSettings>(client.EmulatorSettingsJson);

                    clients.Add(client);
                }

                return clients;

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
        public static async Task<bool> UpdateClientInfoAsync(Client input)
        {
            try
            {
                var client = input;

                var appParameter = "AzureWebJobsStorage";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                // создаем объект для работы с таблицами
                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                // получаем нужную таблицу
                var table = cloudTableClient.GetTableReference("clientsinfo");

                // создаем операцию получения
                TableOperation retrieveOperation = TableOperation.Retrieve<Client>(client.PartitionKey, client.RowKey);

                // выполняем операцию
                var retrievedResult = await table.ExecuteAsync(retrieveOperation);

                // получаем результат
                Client updateEntity = (Client)retrievedResult.Result;

                // изменяем данные и сохраняем
                if (updateEntity != null)
                {
                    updateEntity.AllPositionsJson = JsonConvert.SerializeObject(client.AllPositions);

                    updateEntity.TradeSettingsJson = JsonConvert.SerializeObject(client.TradeSettings);

                    updateEntity.EmulatorSettingsJson = JsonConvert.SerializeObject(client.EmulatorSettings);

                    updateEntity.CountPositions = client.AllPositions.Count;

                    updateEntity.CountOpenOrders = client.AllPositions[client.AllPositions.Count - 1].OpenOrders.FindAll(order => order.State == OrderState.Closed).Count;

                    updateEntity.CountCloseOrders = client.AllPositions[client.AllPositions.Count - 1].CloseOrders.FindAll(order => order.State == OrderState.Closed).Count;

                    updateEntity.ETag = "*";

                    TableOperation updateOperation = TableOperation.Replace(updateEntity);

                    await table.ExecuteAsync(updateOperation);

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (StorageException e)
            {
                Debug.WriteLine(e);
                return false;
            }

            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }
        
        #endregion

        #region логирование

        /// <summary>
        /// отправляет сообщения в лог
        /// </summary>
        public static async Task SendLogMessage(string message)
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