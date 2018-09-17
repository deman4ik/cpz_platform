
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
                else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("CpzSignalsNewSignal"), StringComparison.OrdinalIgnoreCase))
                {
                    Utils.RunAsync(HandleTick((dynamic)dataObject, log));

                    return new HttpResponseMessage(HttpStatusCode.OK);
                }
            }
            return new HttpResponseMessage(HttpStatusCode.NotFound);
        }


        /// <summary>
        /// обработчик тиков
        /// </summary>
        public static async Task HandleTick(dynamic dataObject, TraceWriter log)
        { 
            try
            {
                var currentPrice = (decimal)dataObject.price;

                var partitionKey = Utils.CreatePartitionKey(dataObject.exchange, dataObject.baseq, dataObject.quote);

                // взять нужные позиции
                List<Position> allPositions = await DbContext.GetAllPositionsByKeyAsync(partitionKey);

                // выбираем только не закрытые позиции
                List<Position> positions = allPositions.FindAll(pos => pos.State != PositionState.Close);

                foreach (var position in positions)
                {
                    if(position.State == PositionState.Opening)
                    {
                        foreach (var order in position.OpenOrders)
                        {
                            if(order.State == OrderState.Open)
                            {
                                if (order.OrderType == OrderType.Limit)
                                {

                                }
                                else if (order.OrderType == OrderType.Stop)
                                {
                                    if(order.Direction == "buy")
                                    {
                                        var signalPrice = order.Price - order.Deviation;

                                        var entryPrice = signalPrice + order.Slippage;

                                        if(currentPrice >= entryPrice)
                                        {
                                            var res = DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.NumberPositionInRobot, position);
                                            // отправить проторговщикам
                                            await Utils.SendSignalAllTraders(position);
                                        }
                                    }
                                    else if (order.Direction == "sell")
                                    {
                                        var signalPrice = order.Price + order.Deviation;

                                        var entryPrice = signalPrice - order.Slippage;

                                        if (currentPrice <= entryPrice)
                                        {
                                            var res = DbContext.UpdateEntityById<Position>("Positions", position.PartitionKey, position.NumberPositionInRobot, position);
                                            // отправить проторговщикам
                                            await Utils.SendSignalAllTraders(position);
                                        }
                                    }
                                    position.State = PositionState.Open;
                                }

                            }
                        }
                    }
                    if (position.State == PositionState.Closing)
                    {
                        foreach (var order in position.CloseOrders)
                        {
                            if (order.State == OrderState.Open)
                            {
                                if (order.OrderType == OrderType.Limit)
                                {

                                }
                                else if (order.OrderType == OrderType.Stop)
                                {
                                    if (order.Direction == "buy")
                                    {
                                        var signalPrice = order.Price - order.Deviation;

                                        var entryPrice = signalPrice + order.Slippage;

                                        if (currentPrice >= entryPrice)
                                        {
                                            // отправить проторговщикам
                                            await Utils.SendSignalAllTraders(position);
                                        }
                                    }
                                    else if (order.Direction == "sell")
                                    {
                                        var signalPrice = order.Price + order.Deviation;

                                        var entryPrice = signalPrice - order.Slippage;

                                        if (currentPrice <= entryPrice)
                                        {
                                            // отправить проторговщикам
                                            await Utils.SendSignalAllTraders(position);
                                        }
                                    }
                                    position.State = PositionState.Close;
                                }
                            }
                        }
                    }

                }

                // после того как отправили сигнал, обновляем информацию по позициям в хранилище

            }
            catch (Exception e)
            {                
                throw;
            }
        }
    }
}
