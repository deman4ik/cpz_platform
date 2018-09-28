using CpzTrader.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CpzTrader
{
    public static class Trader
    {
        /// <summary>
        /// клиентский проторговщик
        /// </summary>
        public static async Task RunTrader(string numberOrder, SignalType signalType, Client clientInfo, Position position)
        {
            // находим позицию для которой пришел сигнал
            var needPosition = clientInfo.AllPositions.Find(pos => pos.RowKey == position.RowKey);

            var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

            // если такой позы нет, значит открывается новая
            if (needPosition == null)
            {
                var myPosition = (Position)position.Clone();

                myPosition.OpenOrders = new List<Order>();
                myPosition.CloseOrders = new List<Order>();

                var needOrder = position.GetNeedOrder(numberOrder);

                Order myOrder = (Order)needOrder.Clone();

                myOrder.Volume = clientInfo.RobotSettings.Volume;

                if (signalType != SignalType.CheckLimit)
                {
                    var openOrder = clientInfo.Mode == "emulator" ? Emulator.SendOrder(clientInfo.RobotSettings.Volume, myOrder)
                                                                  : await ActivityFunctions.SendOrder(clientInfo, myOrder);

                    if (openOrder != null)
                    {
                        myOrder.NumberInSystem = openOrder.NumberInSystem;

                        dynamic roundtripData = new JObject();

                        try
                        {
                            dynamic orderData = new JObject();

                            orderData.id = openOrder.NumberInSystem;
                            orderData.roundtripId = myPosition.RowKey;
                            orderData.userId = clientInfo.RowKey;
                            orderData.robotId = myPosition.RobotId;
                            orderData.action = myOrder.Action;
                            orderData.orderTime = openOrder.Time;
                            orderData.price = openOrder.Price;
                            orderData.orderType = openOrder.OrderType;
                            orderData.quantity = openOrder.Executed;

                            await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("NewOpenOrder"), clientInfo.RowKey, orderData);

                            roundtripData.robotid = myPosition.RobotId;
                            roundtripData.signalid = myOrder.NumberInRobot;
                            roundtripData.positionid = myPosition.RowKey;
                            roundtripData.userid = clientInfo.RowKey;
                            roundtripData.action = myOrder.Action;
                            roundtripData.quantity = openOrder.Executed;
                            roundtripData.emulator = clientInfo.Mode;
                            roundtripData.entryDate = myOrder.TimeCreate;
                            roundtripData.entryPrice = myOrder.Price;
                            roundtripData.exitDate = null;
                            roundtripData.exitPrice = null;

                            await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("Roundtrip"), clientInfo.RowKey, roundtripData);
                        }
                        catch(Exception e)
                        {
                            throw;
                        }
                    }
                    else
                    {
                        myOrder.State = OrderState.Fall;

                        string message = $"Error placing order - {myOrder.NumberInRobot}";

                        await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("TraderError"), clientInfo.RowKey, message);
                    }

                    myPosition.OpenOrders.Add(myOrder);

                    clientInfo.AllPositions.Add(myPosition);

                    await DbContext.UpdateEntityById<Client>(tableName, clientInfo.PartitionKey, clientInfo.RowKey, clientInfo, clientInfo.Subject);
                }                
            }
            else
            {                
                if (signalType != SignalType.CheckLimit)
                {
                    var needOrder = position.GetNeedOrder(numberOrder);

                    Order myOrder = (Order)needOrder.Clone();

                    var openVolume = needPosition.GetOpenVolume();

                    if(openVolume != 0)
                    {
                        var openOrder = clientInfo.Mode == "emulator" ? Emulator.SendOrder(clientInfo.RobotSettings.Volume, myOrder)
                                                                      : await ActivityFunctions.SendOrder(clientInfo, myOrder);

                        if (openOrder != null)
                        {
                            myOrder.NumberInSystem = openOrder.NumberInSystem;

                            dynamic orderData = new JObject();

                            orderData.id = openOrder.NumberInSystem;
                            orderData.roundtripId = needPosition.RowKey;
                            orderData.userId = clientInfo.RowKey;
                            orderData.robotId = needPosition.RobotId;
                            orderData.action = myOrder.Action;
                            orderData.orderTime = openOrder.Time;
                            orderData.price = openOrder.Price;
                            orderData.orderType = openOrder.OrderType;
                            orderData.quantity = openOrder.Executed;

                            await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("NewCloseOrder"), clientInfo.RowKey, orderData);


                            dynamic roundtripData = new JObject();

                            roundtripData.id = needPosition.RowKey;
                            roundtripData.robotid = needPosition.RobotId;
                            roundtripData.signalid = myOrder.NumberInRobot;
                            roundtripData.positionid = needPosition.RowKey;
                            roundtripData.userid = clientInfo.RowKey;
                            roundtripData.action = myOrder.Action;
                            roundtripData.quantity = openOrder.Executed;
                            roundtripData.emulator = clientInfo.Mode;
                            roundtripData.entryDate = needPosition.OpenOrders[0].TimeCreate;
                            roundtripData.entryPrice = needPosition.OpenOrders[0].Price;
                            roundtripData.exitDate = myOrder.TimeCreate;
                            roundtripData.exitPrice = myOrder.Price;

                            await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("Roundtrip"), clientInfo.RowKey, roundtripData);
                        }
                        else
                        {
                            myOrder.State = OrderState.Fall;

                            string message = $"Error placing order - {myOrder.NumberInRobot}";

                            await EventGridPublisher.PublishEventInfo(position.Subject, ConfigurationManager.TakeParameterByName("TraderError"), clientInfo.RowKey, message);
                        }

                        needPosition.State = needOrder.OrderType == OrderType.Market ? (int)PositionState.Close : (int)PositionState.Closing;

                        needPosition.CloseOrders.Add(myOrder);

                        await DbContext.UpdateEntityById<Client>(tableName, clientInfo.PartitionKey, clientInfo.RowKey, clientInfo, clientInfo.Subject);
                    }                    
                }
                else
                {
                    var needOrder = needPosition.GetNeedOrder(numberOrder);

                    if (clientInfo.Mode == "emulator")
                    {
                        needOrder.State = OrderState.Closed;
                    }
                    else
                    {
                        var resultChecking = await ActivityFunctions.CheckOrderStatus(clientInfo, needOrder);

                        needOrder.State = resultChecking ? OrderState.Closed : OrderState.Open;
                    }

                    needPosition.State = needPosition.State == (int)PositionState.Opening ? (int)PositionState.Open : (int)PositionState.Close;

                    await DbContext.UpdateEntityById<Client>(tableName, clientInfo.PartitionKey, clientInfo.RowKey, clientInfo, clientInfo.Subject);
                }
            }           
        }
    }
}
