using System.Diagnostics;
using System.Threading.Tasks;

namespace CpzTrader
{
    public static class Log
    {
        /// <summary>
        /// отправляет сообщения в лог
        /// </summary>
        public static async Task SendLogMessage(string message)
        {
            await Task.Run(async () =>
            {
                Debug.WriteLine(message);
                await Task.Delay(1);
            });
        }
    }
}
