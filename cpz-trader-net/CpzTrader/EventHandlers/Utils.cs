using CpzTrader.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CpzTrader.EventHandlers
{
    public static class Utils
    {
        /// <summary>
        /// проверить ключ
        /// </summary>
        /// <param name="key">ключ пришедший в запросе</param>
        public static bool CheckKey(string key)
        {
            string secretKey = Environment.GetEnvironmentVariable("API_KEY");
            return key == secretKey ? true : false;
        }

        /// <summary>
        /// запускает задачу, не дожидаясь ее результата, при этом оставляя возможность обработки исключения
        /// </summary>
        /// <param name="task"></param>
        public static void RunAsync(Task task)
        {
            task.ContinueWith(async t =>
            {
                await EventGridPublisher.PublishEventInfo("",Environment.GetEnvironmentVariable("TraderError"), "",t.Exception.Message);

            }, TaskContinuationOptions.OnlyOnFaulted);
        } 
        
        /// <summary>
        /// отправить сигнал всем проторговщикам
        /// </summary>
        public static async Task SendSignalAllTraders(string numberOrder, SignalType signalType, Position position)
        {
            // получаем из базы клиентов с текущими настройками
            List<Client> clients = await DbContext.GetClientsInfoFromDbAsync(position.RobotId);

            List<Task> parallelTraders = new List<Task>();

            if (clients != null)
            {
                // асинхронно отправляем сигнал всем проторговщикам
                foreach (Client client in clients)
                {
                    if(client.Status == "started")
                    {
                        client.JsonToObject();

                        var parallelTrader = Trader.RunTrader(numberOrder, signalType, client, position);

                        parallelTraders.Add(parallelTrader);
                    }                    
                }

                await Task.WhenAll(parallelTraders);
            }
        }

        /// <summary>
        /// создать ключ раздела для позиции
        /// </summary>
        public static string CreatePartitionKey(string exchange, string asset, string currency)
        {
            return $"{exchange}{asset}{currency}";
        }

        /// <summary>
        /// создать ордер на основании сигнала
        /// </summary>
        /// <param name="signal">сигнал</param>
        /// <returns>готовый ордер</returns>
        public static Order CreateOrder(NewSignal signal)
        {
            return  new Order()
            {
                NumberInRobot = signal.SignalId,
                OrderType = signal.OrderType,
                Price = signal.Price,
                Symbol = $"{signal.Asset}/{signal.Currency}",
                TimeCreate = new DateTime(1970, 1, 1) + TimeSpan.FromSeconds(signal.AlertTime),
                State = signal.OrderType == OrderType.Market ? OrderState.Closed : OrderState.Open,
                Direction = signal.Action == ActionType.CloseShort || signal.Action == ActionType.Long ? "buy" : "sell",
                Action = signal.Action.ToString(),                                
            };
        }

        /// <summary>
        /// создать клиента для запуска
        /// </summary>
        public static Client CreateClient(dynamic data)
        {
            return new Client(data.taskId.ToString(), data.robotId.ToString())
            {
                Mode =data.mode,
                DebugMode = data.debug,
                UserId = data.userId,
                AllPositions = new List<Position>(),
                AllPositionsJson = "[]",
                RobotSettingsJson = "",
                EmulatorSettingsJson = "",
                RobotSettings = new RobotSettings()
                {
                    Exchange = data.exchange,
                    Asset = data.asset,
                    Currency = data.currency,
                    Timeframe =data.timeframe,
                    Volume = data.settings.volume,
                    Slippage = data.settings.slippageStep,
                    Deviation = data.settings.deviation
                },
                EmulatorSettings = new EmulatorSettings()
                {
                    Slippage = data.settings.slippageStep,
                    StartingBalance = 10000,
                    CurrentBalance = 10000                    
                }
                
            };
        }

        /// <summary>
        /// преобразовать данные в приказ коннектору CCXT
        /// </summary>
        public static dynamic CreateOrderData(Client clientInfo, Order signal)
        {
            dynamic data = new JObject();

            data.exchange = clientInfo.RobotSettings.Exchange;
            data.asset = clientInfo.RobotSettings.Asset;
            data.currency = clientInfo.RobotSettings.Currency;

            data.number = signal.NumberInSystem;

            data.volume = signal.Volume;
            data.type = signal.OrderType == OrderType.Limit ? "limit" : "market";
            data.direction = signal.Direction;
            data.price = signal.Price;

            data.publicKey = Environment.GetEnvironmentVariable("TEST_PUBLIC_KEY");
            data.privateKey = Environment.GetEnvironmentVariable("TEST_PRIVATE_KEY");

            return data;
        }
    }
}
