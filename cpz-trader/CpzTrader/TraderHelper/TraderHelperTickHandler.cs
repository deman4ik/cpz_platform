
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.EventGrid.Models;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System.Net;
using CpzTrader.EventHandlers;
using System;
using System.Collections.Generic;
using CpzTrader.Models;

namespace CpzTrader.TraderHelper
{
    public static class TraderHelperTickHandler
    {
        [FunctionName("TraderHelperTickHandler")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
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
                        Utils.RunAsync(HandleTick(eventGridEvent.Subject,(dynamic)dataObject, log));
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                log.Error(e.Message, e);
                throw;
            }            
        }


        /// <summary>
        /// обработчик тиков
        /// </summary>
        public static async Task HandleTick(string subject, dynamic dataObject, TraceWriter log)
        { 
            try
            {
                var currentPrice = (decimal)dataObject.price;

                var partitionKey = Utils.CreatePartitionKey(dataObject.exchange.ToString(), dataObject.baseq.ToString(), dataObject.quote.ToString());

                // взять нужные позиции
                List<Position> allPositions = await DbContext.GetAllPositionsByKeyAsync(partitionKey);

                // выбираем только не закрытые позиции
                List<Position> positions = allPositions.FindAll(pos => (PositionState)pos.State !=  PositionState.Close && (PositionState)pos.State != PositionState.Open);

                foreach (var position in positions)
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
                                    await CheckStopOrder(currentPrice, PositionState.Close, order, position);
                                }
                            }
                            else if(order.State == OrderState.Posted)
                            {
                                if(order.Direction == "buy")
                                {
                                    if(currentPrice < order.Price)
                                    {
                                        order.State = OrderState.Closed;

                                    }
                                }
                                else if(order.Direction == "sell")
                                {
                                    if (currentPrice > order.Price)
                                    {
                                        order.State = OrderState.Closed;
                                    }
                                }
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

                            }
                        }
                    }

                }
            }
            catch (Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.price.ToString(), e.Message);
                await Log.SendLogMessage(e.Message);
            }
        }

        /// <summary>
        /// проверить отложенный лимитник
        /// </summary>
        private static async Task CheckLimitOrder(decimal currentPrice, Order order, Position position)
        {
            if (order.Direction == "buy")
            {
                if(currentPrice - order.Price <= order.Slippage)
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
                            Utils.RunAsync(Utils.SendSignalAllTraders(position));
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
                            Utils.RunAsync(Utils.SendSignalAllTraders(position));
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

                if (currentPrice >= entryPrice)
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
                            Utils.RunAsync(Utils.SendSignalAllTraders(position));
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

                if (currentPrice <= entryPrice)
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
                            Utils.RunAsync(Utils.SendSignalAllTraders(position));
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
