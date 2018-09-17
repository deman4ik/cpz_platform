using CpzTrader.Models;
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
        public static async Task SendSignalAllTraders(Position signal)
        {
            // получаем из базы клиентов с текущими настройками
            List<Client> clients = await DbContext.GetClientsInfoFromDbAsync(signal.PartitionKey);

            List<Task> parallelTraders = new List<Task>();

            if (clients != null)
            {
                // асинхронно отправляем сигнал всем проторговщикам
                foreach (Client client in clients)
                {
                    var parallelTrader = Trader.RunTrader(client, signal);

                    parallelTraders.Add(parallelTrader);
                }

                await Task.WhenAll(parallelTraders);
            }

            string message = $"Сигнал от робота - {signal.PartitionKey} обработан.";

            //await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("SignalHandled"), message);
        }

        /// <summary>
        /// создать ключ раздела для позиции
        /// </summary>
        public static string CreatePartitionKey(string exchange, string baseq, string quote)
        {
            return $"{exchange}#{baseq}-{quote}";
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
                NumberInRobot = signal.NumberOrderInRobot,
                OrderType = signal.Type,
                Price = signal.Price,
                Symbol = $"{signal.Baseq}/{signal.Quote}",
                TimeCreate = DateTime.UtcNow,
                State = signal.Type == OrderType.Market ? OrderState.Closed : OrderState.Open,
                Direction = signal.Action == ActionType.CloseShort || signal.Action == ActionType.Long ? "buy" : "sell",
            };
        }

        /// <summary>
        /// создать клиента для запуска
        /// </summary>
        public static Client CreateClient(dynamic data)
        {
            Client Ncl = new Client(data.taskId.ToString(), data.robotId.ToString());

            Ncl.Mode = data.mode;
            Ncl.DebugMode = data.debug;
            Ncl.UserId = data.userId;
            Ncl.AllPositions = new List<Position>();
            Ncl.RobotSettings = new RobotSettings()
            {
                Exchange = data.exchange,
                Baseq = data.asset,
                Quote = data.currency,
                Timeframe = data.timeframe,
                Volume = data.settings.volume,
                Slippage = data.settings.slippageStep,
            };
            Ncl.EmulatorSettings = new EmulatorSettings()
            {
                Slippage = data.settings.slippageStep,
                StartingBalance = 10000,
                CurrentBalance = 10000
            };

            return new Client(data.taskId.ToString(), data.robotId.ToString())
            {
                Mode =data.mode,
                DebugMode = data.debug,
                UserId = data.userId,
                AllPositions = new List<Position>(),
                RobotSettings = new RobotSettings()
                {
                    Exchange = data.exchange,
                    Baseq = data.asset,
                    Quote = data.currency,
                    Timeframe =data.timeframe,
                    Volume = data.settings.volume,
                    Slippage = data.settings.slippageStep,                    
                },
                EmulatorSettings = new EmulatorSettings()
                {
                    Slippage = data.settings.slippageStep,
                    StartingBalance = 10000,
                    CurrentBalance = 10000                    
                }
                
            };
        }

    }
}
