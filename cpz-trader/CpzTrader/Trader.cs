using CpzTrader.Models;
using System.Threading.Tasks;

namespace CpzTrader
{
    public static class Trader
    {
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
                                                           : await ActivityFunctions.SendOrder(clientInfo, newSignal);

                await EventGridPublisher.PublishEvent(ConfigurationManager.TakeParameterByName("NewOpenOrder"), openOrder);

                if (openOrder != null)
                {
                    newPosition.OpenOrders.Add(openOrder);

                    // сохраняем позицию в клиенте
                    clientInfo.AllPositions.Add(newPosition);
                }
            }
            if (needPosition != null)
            {
                // наращиваем объем позиции
                if (action == ActionType.NewOpenOrder && canOpen)
                {
                    var openOrder = clientInfo.IsEmulation ? Emulator.SendOrder(clientInfo.TradeSettings.Volume, newSignal)
                                                           : await ActivityFunctions.SendOrder(clientInfo, newSignal);

                    await EventGridPublisher.PublishEvent(ConfigurationManager.TakeParameterByName("NewOpenOrder"), openOrder);

                    if (openOrder != null)
                    {
                        needPosition.OpenOrders.Add(openOrder);
                    }

                } // сокращаем объем позиции
                else if (action == ActionType.NewCloseOrder)
                {
                    var needCloseVolume = needPosition.GetOpenVolume() * newSignal.PercentVolume / 100;

                    var closeOrder = clientInfo.IsEmulation ? Emulator.SendOrder(needCloseVolume, newSignal)
                                                            : await ActivityFunctions.SendOrder(clientInfo, newSignal);

                    await EventGridPublisher.PublishEvent(ConfigurationManager.TakeParameterByName("NewCloseOrder"), closeOrder);

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
                            var resultChecking = await ActivityFunctions.CheckOrderStatus(needOrder.NumberInSystem, clientInfo, newSignal);

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
                            var cancellationResult = await ActivityFunctions.CancelOrder(needOrder.NumberInSystem, clientInfo, newSignal);
                        }
                    }
                }
            }

            await DbContext.UpdateClientInfoAsync(clientInfo);
        }
    }
}
