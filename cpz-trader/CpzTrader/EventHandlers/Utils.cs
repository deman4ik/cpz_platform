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
                await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("TraderError"), t.Exception.Message);

            }, TaskContinuationOptions.OnlyOnFaulted);
        }        
    }
}
