using CpzTrader.Models;
using CpzTrader.Services;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CpzTrader.EventHandlers
{
    public static class TradeSignalHandler
    {
        /// <summary>
        /// обработка сигнала от робота
        /// </summary>
        [FunctionName("SignalHandler")]
        public static async Task<HttpResponseMessage> SignalHandler(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "signalEvents")]HttpRequestMessage req, ILogger log)
        {
            try
            {
                string requestContent = await req.Content.ReadAsStringAsync();

                EventGridEvent[] eventGridEvents = JsonConvert.DeserializeObject<EventGridEvent[]>(requestContent);

                foreach (EventGridEvent eventGridEvent in eventGridEvents)
                {
                    //if (!Utils.CheckKey(eventGridEvent.Subject))
                    //{
                    //    return new HttpResponseMessage(HttpStatusCode.OK)
                    //    {
                    //        Content = new StringContent(JsonConvert.SerializeObject("Не верный ключ"))
                    //    };
                    //}

                    JObject dataObject = eventGridEvent.Data as JObject;

                    IList<string> errorMessages;

                    // В зависимости от типа события выполняем определенную логику
                    // валидация
                    if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("SubscriptionValidationEvent"), StringComparison.OrdinalIgnoreCase))
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
                    // новый сигнал                    
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("CpzSignalsNewSignal"), StringComparison.OrdinalIgnoreCase))
                    {
                        var isValid = Validator.CheckData("signal", dataObject, out errorMessages);

                        if (isValid)
                        {
                            Utils.RunAsync(HandleSignal(eventGridEvent.Subject, dataObject, log));
                        }
                        else
                        {
                            string message = "Validation error in the signal";

                            string internalError = JsonConvert.SerializeObject(errorMessages);

                            // отправить сообщение об ошибке
                            await EventGridPublisher.SendError((int)ErrorCodes.SignalData, message, dataObject.GetValue("robotId").ToString(), eventGridEvent.Subject, dataObject, internalError);
                        }
                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                log.LogError(e.Message, e);
                throw;
            }
        }

        /// <summary>
        /// обработчик сигналов от робота
        /// </summary>
        public static async Task HandleSignal(string subject, JObject dataObject, ILogger log)
        {
            try
            {
                var signal = dataObject.ToObject<NewSignal>();

                // получаем биржу и бумагу по которой пришел сигнал
                var clients = await DbContext.GetClientsInfoFromDbAsync(signal.RobotId, subject);

                string exchange;

                string asset;

                string currency;

                if(clients != null && clients.Count != 0)
                {
                    exchange = clients[0].RobotSettings.Exchange;

                    asset = clients[0].RobotSettings.Asset;

                    currency = clients[0].RobotSettings.Currency;
                }
                else
                {
                    // сигнал получен но у этого робота нет клиентов
                    return;
                }

                signal.Asset = asset;
                signal.Currency = currency;

                var action = signal.Action;

                string partitionKey = Utils.CreatePartitionKey(exchange, asset, currency);

                var tableName = ConfigurationManager.TakeParameterByName("PositionsTableName");

                if (action == ActionType.Long || action == ActionType.Short)
                {
                    Position newPosition = new Position(signal.PositionId.ToString(), partitionKey);

                    newPosition.Subject = subject;

                    newPosition.RobotId = signal.RobotId;

                    Order newOrder = Utils.CreateOrder(signal);

                    if(signal.Settings != null)
                    {
                        newOrder.Slippage = signal.Settings.SlippageStep == null ? (decimal)clients[0].RobotSettings.Slippage : (decimal)signal.Settings.SlippageStep;

                        newOrder.Deviation = signal.Settings.Deviation == null ? (decimal)clients[0].RobotSettings.Deviation : (decimal)signal.Settings.Deviation;
                    }
                    else
                    {
                        newOrder.Slippage = (decimal)clients[0].RobotSettings.Slippage;

                        newOrder.Deviation = (decimal)clients[0].RobotSettings.Deviation;
                    }
                    
                    newPosition.OpenOrders.Add(newOrder);

                    newPosition.State = signal.OrderType == OrderType.Market ? (int)PositionState.Open : (int)PositionState.Opening;//"open" : "opening";

                    // если нужно исполнить ордер по рынку то сразу его одаем проторговщикам и после этого отдаем помошнику через хранилище
                    if (signal.OrderType == OrderType.Market)
                    {
                        await Utils.SendSignalAllTraders(newOrder.NumberInRobot, SignalType.OpenByMarket, newPosition);
                    }

                    newPosition.ObjectToJson();

                    // сохранить в хранилище
                    var result = await DbContext.InsertEntity<Position>(tableName, newPosition, subject);
                }
                else
                {                    
                    // получить из хранилища позицию для которой пришел сигнал
                    Position needPosition = await DbContext.GetEntityById<Position>(tableName, partitionKey, signal.PositionId.ToString(), subject);

                    needPosition.JsonToObject();

                    Order newOrder = Utils.CreateOrder(signal);

                    if (signal.Settings != null)
                    {
                        newOrder.Slippage = signal.Settings.SlippageStep == null ? (decimal)clients[0].RobotSettings.Slippage : (decimal)signal.Settings.SlippageStep;

                        newOrder.Deviation = signal.Settings.Deviation == null ? (decimal)clients[0].RobotSettings.Deviation : (decimal)signal.Settings.Deviation;
                    }
                    else
                    {
                        newOrder.Slippage = (decimal)clients[0].RobotSettings.Slippage;

                        newOrder.Deviation = (decimal)clients[0].RobotSettings.Deviation;
                    }

                    needPosition.CloseOrders.Add(newOrder);

                    needPosition.State = signal.OrderType == OrderType.Market ? (int)PositionState.Close : (int)PositionState.Closing;//signal.OrderType == OrderType.Market ? PositionState.Close.ToString() : PositionState.Closing.ToString();

                    // если нужно исполнить ордер по рынку то сразу его одаем проторговщикам и после этого отдаем помошнику через хранилище
                    if (signal.OrderType == OrderType.Market)
                    {
                        await Utils.SendSignalAllTraders(newOrder.NumberInRobot, SignalType.OpenByMarket, needPosition);
                    }

                    needPosition.ObjectToJson();

                    // сохранить обновленную позицию в хранилище
                    var res = await DbContext.UpdateEntityById<Position>(tableName, partitionKey, signal.PositionId.ToString(), needPosition, subject);                    
                }
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("SignalHandled"), signal.SignalId);
            }
            catch (Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.ToObject<NewSignal>().SignalId, e.Message);
                log.LogError(e.Message, e);
            }
        }
    }
}
