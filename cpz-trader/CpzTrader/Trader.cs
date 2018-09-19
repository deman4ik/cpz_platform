using CpzTrader.Models;
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

            // если такой позы нет, значит открывается новая
            if (needPosition == null)
            {
                var myPosition = (Position)position.Clone();

                myPosition.OpenOrders = new List<Order>();
                myPosition.CloseOrders = new List<Order>();

                var needOrder = position.GetNeedOrder(numberOrder);

                Order myOrder = (Order)needOrder.Clone();

                if (signalType != SignalType.CheckLimit)
                {
                    var openOrder = clientInfo.Mode == "emulator" ? Emulator.SendOrder(clientInfo.RobotSettings.Volume, myOrder)
                                                                  : await ActivityFunctions.SendOrder(clientInfo, myOrder);

                    if (openOrder != null)
                    {
                        myOrder.NumberInSystem = openOrder.NumberInSystem;                                              
                    }
                    else
                    {
                        myOrder.State = OrderState.Fall;
                    }

                    myPosition.OpenOrders.Add(myOrder);

                    clientInfo.AllPositions.Add(myPosition);

                    await DbContext.UpdateClientInfoAsync(clientInfo);
                }                
            }
            else
            {                
                if (signalType != SignalType.CheckLimit)
                {
                    var needOrder = position.GetNeedOrder(numberOrder);

                    Order myOrder = (Order)needOrder.Clone();

                    var openOrder = clientInfo.Mode == "emulator" ? Emulator.SendOrder(clientInfo.RobotSettings.Volume, myOrder)
                                                                  : await ActivityFunctions.SendOrder(clientInfo, myOrder);

                    if (openOrder != null)
                    {
                        myOrder.NumberInSystem = openOrder.NumberInSystem;
                    }
                    else
                    {
                        myOrder.State = OrderState.Fall;
                    }

                    needPosition.CloseOrders.Add(myOrder);

                    clientInfo.AllPositions.Add(needPosition);

                    await DbContext.UpdateClientInfoAsync(clientInfo);
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
                        var resultChecking = await ActivityFunctions.CheckOrderStatus(needOrder.NumberInSystem, clientInfo, needOrder);

                        needOrder.State = resultChecking ? OrderState.Closed : OrderState.Open;
                    }
                }
            }           
        }
    }
}
