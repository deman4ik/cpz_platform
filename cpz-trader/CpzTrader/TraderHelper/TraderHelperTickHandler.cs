using CpzTrader.EventHandlers;
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
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CpzTrader.TraderHelper
{
    public static class TraderHelperTickHandler
    {
        [FunctionName("TraderHelperTickHandler")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = "newTick")]HttpRequestMessage req, ILogger log)
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

                        return new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent(JsonConvert.SerializeObject(responseData))
                        };
                    }
                    // новый сигнал                    
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("NewTick"), StringComparison.OrdinalIgnoreCase))
                    {
                        var isValid = Validator.CheckData("signal", dataObject, out errorMessages);

                        if (isValid)
                        {
                            Utils.RunAsync(HandleTick(eventGridEvent.Subject, (dynamic)dataObject, log));
                        }
                        else
                        {
                            dynamic validationError = new JObject();

                            validationError.code = ErrorCodes.SignalData;
                            validationError.message = "Validation error in the tick";

                            dynamic details = new JObject();

                            details.input = dataObject;
                            details.taskId = eventGridEvent.Subject;
                            details.internalError = JsonConvert.SerializeObject(errorMessages);

                            validationError.details = details;

                            await EventGridPublisher.PublishEventInfo(eventGridEvent.Subject, ConfigurationManager.TakeParameterByName("TraderError"), validationError);
                        }                        
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                log.LogError(e.Message, e);
                throw;
            }            
        }


        /// <summary>
        /// обработчик тиков
        /// </summary>
        public static async Task HandleTick(string subject, dynamic dataObject, ILogger log)
        { 
            try
            {
                var currentPrice = (decimal)dataObject.price;

                var partitionKey = Utils.CreatePartitionKey(dataObject.exchange.ToString(), dataObject.baseq.ToString(), dataObject.quote.ToString());

                // взять нужные позиции
                List<Position> needPositions = await DbContext.GetAllPositionsByKeyAsync(partitionKey);

                foreach (var position in needPositions)
                {
                    if((PositionState)position.State == PositionState.Opening)
                    {
                        foreach (var order in position.OpenOrders)
                        {
                            if(order.State == OrderState.Open)
                            {
                                if (order.OrderType == OrderType.Limit)
                                {
                                    await CheckLimitOrder(currentPrice, order, position);
                                }
                                else if (order.OrderType == OrderType.Stop)
                                {
                                    await CheckStopOrder(currentPrice, PositionState.Open, order, position);
                                }
                            }
                            else if(order.State == OrderState.Posted)
                            {
                                await CheckPostedOrder(currentPrice, PositionState.Open, order, position);
                            }
                        }
                    }
                    if ((PositionState)position.State == PositionState.Closing)
                    {
                        foreach (var order in position.CloseOrders)
                        {
                            if (order.State == OrderState.Open)
                            {
                                if (order.OrderType == OrderType.Limit)
                                {
                                    await CheckLimitOrder(currentPrice, order, position);
                                }
                                else if (order.OrderType == OrderType.Stop)
                                {
                                    await CheckStopOrder(currentPrice, PositionState.Close, order, position);
                                }
                            }
                            else if (order.State == OrderState.Posted)
                            {
                                await CheckPostedOrder(currentPrice, PositionState.Close, order, position);
                            }
                        }
                    }

                }
            }
            catch (Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.price.ToString(), e.Message);
                log.LogError(e.Message, e);
            }
        }

        /// <summary>
        /// проверить размещенный ордер
        /// </summary>
        private static async Task CheckPostedOrder(decimal currentPrice, PositionState state, Order order, Position position)
        {
            if ((order.Direction == "buy" && currentPrice < order.Price) || (order.Direction == "sell" && currentPrice > order.Price))
            {
                order.State = OrderState.Closed;
                position.State = (int)state;
                try
                {
                    // обновляем информацию о позиции в хранилище
                    var result = await DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.RowKey, position);

                    // если обновление прошло успешно, даем сигнал трейдерам проверить свои ордера
                    if (result)
                    {
                        // отправить проторговщикам
                        Utils.RunAsync(Utils.SendSignalAllTraders(order.NumberInRobot, SignalType.CheckLimit, position));
                    }
                }
                catch (Exception e)
                {
                    // если выпало исключение при обновлении значит запись была обновлена с момента извлечения, а это значит что сигнал уже был отправлен                                                
                }
            }            
        }

        /// <summary>
        /// проверить отложенный лимитник
        /// </summary>
        private static async Task CheckLimitOrder(decimal currentPrice, Order order, Position position)
        {
            if (order.Direction == "buy")
            {
                if (currentPrice - order.Price <= order.Slippage)
                {
                    order.State = OrderState.Posted;
                    position.ObjectToJson();

                    try
                    {
                        // обновляем информацию о позиции в хранилище
                        var result = await DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.RowKey, position);

                        // если обновление прошло успешно, даем сигнал трейдерам
                        if (result)
                        {
                            // отправить проторговщикам
                            Utils.RunAsync(Utils.SendSignalAllTraders(order.NumberInRobot, SignalType.SetLimit, position));
                        }
                    }
                    catch (Exception e)
                    {
                        // если выпало исключение при обновлении значит запись была обновлена с момента извлечения, а это значит что сигнал уже был отправлен                                                
                    }
                }
            }
            else if (order.Direction == "sell")
            {
                if (order.Price - currentPrice <= order.Slippage)
                {
                    order.State = OrderState.Posted;
                    position.ObjectToJson();

                    try
                    {
                        // обновляем информацию о позиции в хранилище
                        var result = await DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.RowKey, position);

                        // если обновление прошло успешно, даем сигнал трейдерам
                        if (result)
                        {
                            // отправить проторговщикам
                            Utils.RunAsync(Utils.SendSignalAllTraders(order.NumberInRobot, SignalType.SetLimit, position));
                        }
                    }
                    catch (Exception e)
                    {
                        // если выпало исключение при обновлении значит запись была обновлена с момента извлечения, а это значит что сигнал уже был отправлен                                                
                    }
                }
            }
        }

        /// <summary>
        /// проверить стоп ордер 
        /// </summary>
        /// <param name="currentPrice">цена пришедшего тика</param>
        /// <param name="state">состояние позиции</param>
        /// <param name="order">ссылка на проверяемый ордер</param>
        /// <param name="position">позиция, которой принадлежит ордер</param>
        private static async Task CheckStopOrder(decimal currentPrice, PositionState state, Order order, Position position)
        {
            if (order.Direction == "buy")
            {
                var signalPrice = order.Price - order.Deviation;

                var entryPrice = signalPrice + order.Slippage;

                if (currentPrice >= signalPrice)
                {
                    order.Price = entryPrice;
                    order.State = OrderState.Closed;
                    order.OrderType = OrderType.Market;
                    position.State = (int)state;
                    position.ObjectToJson();

                    try
                    {
                        // обновляем информацию о позиции в хранилище
                        var result = await DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.RowKey, position);

                        // если обновление прошло успешно, даем сигнал трейдерам
                        if (result)
                        {
                            // отправить проторговщикам
                            Utils.RunAsync(Utils.SendSignalAllTraders(order.NumberInRobot, SignalType.OpenByMarket, position));
                        }
                    }
                    catch (Exception e)
                    {
                        // если выпало исключение при обновлении значит запись была обновлена с момента извлечения, а это значит что сигнал уже был отправлен                                                
                    }
                }
            }
            else if (order.Direction == "sell")
            {
                var signalPrice = order.Price + order.Deviation;

                var entryPrice = signalPrice - order.Slippage;

                if (currentPrice <= signalPrice)
                {
                    order.Price = entryPrice;
                    order.State = OrderState.Closed;
                    order.OrderType = OrderType.Market;
                    position.State = (int)state;
                    position.ObjectToJson();

                    try
                    {
                        // обновляем информацию о позиции в хранилище
                        var res2 = await DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.RowKey, position);

                        // если обновление прошло успешно, даем сигнал трейдерам
                        if (res2)
                        {
                            // отправить проторговщикам
                            Utils.RunAsync(Utils.SendSignalAllTraders(order.NumberInRobot, SignalType.OpenByMarket, position));
                        }
                    }
                    catch (Exception e)
                    {
                        // если выпало исключение при обновлении значит запись была обновлена с момента извлечения, а это значит что сигнал уже был отправлен                                                
                    }
                }
            }
        }
    }
}
