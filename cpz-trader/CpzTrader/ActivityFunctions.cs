using CpzTrader.Models;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace CpzTrader
{
    /// <summary>
    /// функции взаимодействия с коннектором
    /// </summary>
    public static class ActivityFunctions
    {
        public static HttpClient httpClient = new HttpClient();

        /// <summary>
        /// отправить ордер на биржу
        /// </summary>        
        public static async Task<Order> SendOrder(Client clientInfo, NewSignal signal)
        {
            (Client client, NewSignal newSignal) tradeInfo = (clientInfo, signal);

            var url = "http://localhost:7077/api/HttpTriggerJS/SetOrder";

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                Order newOrder = JsonConvert.DeserializeObject<Order>(operationResult);

                if (newOrder.State == OrderState.Open)
                {
                    return newOrder;
                }
            }
            else if (status == HttpStatusCode.InternalServerError)
            {
                (int code, string message) errorInfo = JsonConvert.DeserializeObject<(int, string)>(operationResult);

                // отправить сообщение об ошибке в лог
                if (errorInfo.code == 100)
                {
                    // ошибка идентификации пользователя на бирже
                }
                else if (errorInfo.code == 110)
                {
                    // Не достаточно средств для выставления ордера
                }
                else if (errorInfo.code == 120)
                {
                    // Ошибка в параметрах ордера
                }
            }
            return null;
        }

        /// <summary>
        /// отменить ордер
        /// </summary>        
        public static async Task<bool> CancelOrder(string orderNumber, Client clientInfo, NewSignal signal)
        {
            (string numberOrder, Client client, NewSignal signal) tradeInfo = (orderNumber, clientInfo, signal);

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var url = "http://localhost:7077/api/HttpTriggerJS/CancelOrder";

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                var canceledOrder = JsonConvert.DeserializeObject<Order>(operationResult);

                if (canceledOrder.State == OrderState.Canceled)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else if (status == HttpStatusCode.InternalServerError)
            {
                (int code, string message) errorInfo = JsonConvert.DeserializeObject<(int, string)>(operationResult);

                // отправить сообщение об ошибке в лог
                if (errorInfo.code == 400)
                {
                    // Ошибка снятия, ордер уже отменен или исполнен

                }
                else if (errorInfo.code == 410)
                {
                    // Не удалось отменить ордер, ошибка сети
                }
            }
            return false;
        }

        /// <summary>
        /// проверить статус ордера
        /// </summary>        
        public static async Task<bool> CheckOrderStatus(string orderNumber, Client clientInfo, NewSignal signal)
        {
            (string numberOrder, Client client, NewSignal signal) tradeInfo = (orderNumber, clientInfo, signal);

            var dataAsString = JsonConvert.SerializeObject(tradeInfo);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var url = "http://localhost:7077/api/HttpTriggerJS/CheckOrder";

            var orderResult = await httpClient.PostAsync(url, content);

            var operationResult = await orderResult.Content.ReadAsStringAsync();

            var status = orderResult.StatusCode;

            if (status == HttpStatusCode.OK)
            {
                Order orderInfo = JsonConvert.DeserializeObject<Order>(operationResult);

                if (orderInfo.Volume == orderInfo.Executed)
                {
                    return true;
                }
                return false;
            }
            else
            {
                return false;
            }
        }

    }
}
