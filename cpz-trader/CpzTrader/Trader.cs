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
        [FunctionName("SendOrder")]
        public static async Task<Order> SendOrder([ActivityTrigger] DurableActivityContext input)
        {
            (Client client, NewSignal newSignal) tradeInfo = input.GetInput<(Client, NewSignal)>();

            var url = "http://localhost:7077/api/HttpTriggerJS/SetOrder";

            var orderResult = await httpClient.PostAsJsonAsync(url, tradeInfo);

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                var order = await orderResult.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<Order>(order);
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// отменить ордер
        /// </summary>        
        [FunctionName("CancelOrder")]
        public static async Task<bool> CancelOrder([ActivityTrigger] DurableActivityContext input)
        {

            (Client client, string numberOrder) tradeInfo = input.GetInput<(Client, string)>();

            var url = "http://localhost:7077/api/HttpTriggerJS/CancelOrder";

            var orderResult = await httpClient.PostAsJsonAsync(url, tradeInfo);

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// проверить статус ордера
        /// </summary>        
        [FunctionName("CheckOrderStatus")]
        public static async Task<bool> CheckOrderStatus([ActivityTrigger] DurableActivityContext input)
        {

            (Client client, string numberOrder) tradeInfo = input.GetInput<(Client, string)>();

            var url = "http://localhost:7077/api/HttpTriggerJS";

            var orderResult = await httpClient.PostAsJsonAsync(url, tradeInfo);

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// проверить баланс
        /// </summary>        
        [FunctionName("CheckBalance")]
        public static async Task<bool> CheckBalance([ActivityTrigger] DurableActivityContext input)
        {
            (Client client, NewSignal newSignal) tradeInfo = input.GetInput<(Client, NewSignal)>();

            Client cl = tradeInfo.client;

            NewSignal newSignal = tradeInfo.newSignal;

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                     
            var url = "http://localhost:7077/api/HttpTriggerJS";

            var orderResult = await httpClient.PostAsync(url, content);

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                return true;
            }
            else
            {
                return false;
            }
        }


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

                // выполняем бизнес логику согласно данным из сигнала

                var action = newSignal.Action;

                bool canOpen = true;

                // если сигнал на открытие нового ордера, проверяем достаточно ли средств на балансе
                //if (action == ActionType.NewOpenOrder || action == ActionType.NewPosition)
                //{
                //    canOpen = clientInfo.IsEmulation ? Emulator.CheckBalance(clientInfo.EmulatorSettings.CurrentBalance, newSignal.Price, clientInfo.TradeSettings.Volume)
                //                                     : await context.CallActivityAsync<bool>("CheckBalance", (clientInfo, newSignal));
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
                                                           : await context.CallActivityAsync<Order>("SendOrder", (clientInfo, newSignal));

                    await context.CallActivityAsync("PublishEventDurable", ("CPZ.Trader.NewOrder", openOrder));

                    if (openOrder != null)
                    {
                        newPosition.OpenOrders.Add(openOrder);

                        // сохраняем позицию в клиенте
                        clientInfo.AllPositions.Add(newPosition);
                    }
                }
                // наращиваем объем позиции
                else if (action == ActionType.NewOpenOrder && canOpen)
                {
                    var openOrder = clientInfo.IsEmulation ? Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal)
                                                           : await context.CallActivityAsync<Order>("SendOrder", (clientInfo, newSignal));

                    await PublishEvent("CPZ.Trader.NewOrder", openOrder);

                    await context.CallActivityAsync("PublishEventDurable", ("CPZ.Trader.NewOrder", openOrder));

                    if (openOrder != null)
                    {
                        needPosition.OpenOrders.Add(openOrder);
                    }

                } // сокращаем объем позиции
                else if (action == ActionType.NewCloseOrder)
                {
                    var needCloseVolume = needPosition.GetOpenVolume() * newSignal.PercentVolume / 100;

                    var closeOrder = clientInfo.IsEmulation ? Emulator.SendOrder(needCloseVolume, newSignal)
                                                            : await context.CallActivityAsync<Order>("SendOrder", (clientInfo, newSignal));

                    await context.CallActivityAsync("PublishEventDurable", ("CPZ.Trader.NewCloseOrder", closeOrder));

                    if (closeOrder != null)
                    {
                        needPosition.CloseOrders.Add(closeOrder);
                    }

                    if(newSignal.PercentVolume == 100)
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
                        if(clientInfo.IsEmulation)
                        {
                            needOrder.State = OrderState.Done;
                        }
                        else
                        {
                            var resultChecking = await context.CallActivityAsync<bool>("CheckOrderStatus", (clientInfo, needOrder.NumberInSystem));

                            needOrder.State = resultChecking ? OrderState.Done : OrderState.Activ;
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
                            var cancellationResult = await context.CallActivityAsync<bool>("CancelOrder", (clientInfo, needOrder.NumberInSystem));
                        }

                        await context.CallActivityAsync("PublishEventDurable", ("CPZ.Trader.CancelOrder", needOrder));
                    }                    
                }
                
                // обновляем информацию о клиенте в базе

                await context.CallActivityAsync<bool>("UpdateClientInfoAsync", clientInfo);

                // переходим на следущую итерацию, передавая себе текущее состояние
                context.ContinueAsNew(clientInfo);

            }
            catch (Exception e)
            {
                await context.CallActivityAsync( "SendLogMessage",e.Message);
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
                        List<Client> clients = await GetClientsInfoFromDbAsync(eventData.AdvisorName);

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
                    else if (string.Equals(eventGridEvent.EventType, "noDurable", StringComparison.OrdinalIgnoreCase))
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
        /// проверить баланс
        /// </summary>        
        [FunctionName("PublishEventDurable")]
        public static async Task PublishEventDurable([ActivityTrigger] DurableActivityContext input)
        {
            (string eventType, Order order) orderInfo = input.GetInput<(string eventType, Order order)>();

            string _topicEndpoint = Environment.GetEnvironmentVariable("EG_TOPIC_ENDPOINT");

            var _topicHostname = new Uri(_topicEndpoint).Host;

            string _topicKey = Environment.GetEnvironmentVariable("EG_TOPIC_KEY");

            var topicCredentials = new TopicCredentials(_topicKey);

            EventGridClient eventGridClient = new EventGridClient(topicCredentials);

            List<EventGridEvent> eventsList = new List<EventGridEvent>();

            for (int i = 0; i < 1; i++)
            {
                // Формируем данные
                dynamic data = new JObject();
                data.number = orderInfo.order.NumberInRobot;
                data.symbol = orderInfo.order.Symbol;
                data.time = orderInfo.order.Time;

                // Создаем новое событие
                eventsList.Add(new EventGridEvent()
                {
                    Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                    Subject = $"Ордер номер : {orderInfo.order.NumberInRobot} # бумага : {orderInfo.order.Symbol} # создан : {orderInfo.order.Time}", // тема события
                    DataVersion = "1.0", // версия данных
                    EventType = orderInfo.eventType, // тип события
                    Data = data, // данные события
                    EventTime = DateTime.Now // время формирования события
                });
            }

            // Отправка событий в тему
            await eventGridClient.PublishEventsAsync(_topicHostname, eventsList);
        }

        /// <summary>
        /// опубликовать событие в event grid
        /// </summary>        
        public static async Task PublishEvent(string eventType,Order order)
        {
            string _topicEndpoint = Environment.GetEnvironmentVariable("EG_TOPIC_ENDPOINT");

            var _topicHostname = new Uri(_topicEndpoint).Host;

            string _topicKey = Environment.GetEnvironmentVariable("EG_TOPIC_KEY");

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
                var openOrder = Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal);

                await PublishEvent("CPZ.Trader.NewOpenOrder", openOrder);
                                                       
                if (openOrder != null)
                {
                    newPosition.OpenOrders.Add(openOrder);

                    // сохраняем позицию в клиенте
                    clientInfo.AllPositions.Add(newPosition);
                }
            }
            // наращиваем объем позиции
            else if (action == ActionType.NewOpenOrder && canOpen)
            {
                var openOrder = Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal);

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
                        needOrder.State = OrderState.Done;
                    }                   
                }

            } // отозвать ордер
            else if (action == ActionType.CancelOrder)
            {
                var needOrder = needPosition.GetNeedOrder(newSignal.NumberOrderInRobot);

                await PublishEvent("CPZ.Trader.CancelOrder", needOrder);

                if (needOrder != null)
                {
                    if (clientInfo.IsEmulation)
                    {
                        needOrder.State = OrderState.Canceled;
                    }
                }
            }

            await UpdateClientInfoAsyncSecond(clientInfo);
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
                    
                    IsEmulation = true,                    
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
        /// <param name="advisorName"></param>
        /// <returns></returns>
        private static async Task<List<Client>> GetClientsInfoFromDbAsync(string advisorName)
        {
            try
            {
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

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
        public static async Task<bool> UpdateClientInfoAsyncSecond(Client input)
        {
            try
            {
                var client = input;

                // подключаемся к локальному хранилищу
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

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

                    updateEntity.CountOpenOrders = client.AllPositions[client.AllPositions.Count - 1].OpenOrders.FindAll(order => order.State == OrderState.Done).Count;

                    updateEntity.CountCloseOrders = client.AllPositions[client.AllPositions.Count - 1].CloseOrders.FindAll(order => order.State == OrderState.Done).Count;

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

        /// <summary>
        /// обновить запись о клиенте в базе
        /// </summary>
        [FunctionName("UpdateClientInfoAsync")]
        public static async Task<bool> UpdateClientInfoAsync(
            [ActivityTrigger] DurableActivityContext input)
        {
            try
            {
                var client = input.GetInput<Client>();
              
                // подключаемся к локальному хранилищу
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

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
                    updateEntity.CountPositions = client.AllPositions.Count;

                    updateEntity.CountOpenOrders = client.AllPositions[client.AllPositions.Count - 1].OpenOrders.FindAll(order=>order.State == OrderState.Done).Count;

                    updateEntity.CountCloseOrders = client.AllPositions[client.AllPositions.Count - 1].CloseOrders.FindAll(order => order.State == OrderState.Done).Count;

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
        [FunctionName("SendLogMessage")]
        public static async Task SendLogMessage([ActivityTrigger] DurableActivityContext input)
        {
            var message = input.GetInput<string>();

            await Task.Run(async () =>
            {
                Debug.WriteLine(message);
                await Task.Delay(1);
            });
        }
        #endregion
    }
}