using CpzTrader.EventHandlers;
using CpzTrader.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
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
        /// отправить запрос
        /// </summary>
        private static async Task<HttpResponseMessage> SendRequest(string endPoint,Client clientInfo, Order signal)
        {
            dynamic data = Utils.CreateOrderData(clientInfo, signal);

            var url = Environment.GetEnvironmentVariable("CCXT_CONNECTOR");

            var dataAsString = JsonConvert.SerializeObject(data);

            var content = new StringContent(dataAsString);

            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var orderResult = await httpClient.PostAsync(url + endPoint, content);

            return orderResult;
        }

        /// <summary>
        /// отправить ордер на биржу
        /// </summary>        
        public static async Task<Order> SendOrder(Client clientInfo, Order signal)
        {
            try
            {
                var orderResult = await SendRequest("SetOrder", clientInfo, signal);

                var operationResult = await orderResult.Content.ReadAsStringAsync();

                var status = orderResult.StatusCode;

                if (status == HttpStatusCode.OK)
                {
                    Order newOrder = JsonConvert.DeserializeObject<Order>(operationResult);

                    if(newOrder.Executed != 0)
                    {
                        newOrder.State = OrderState.Closed;
                    }
                    else
                    {
                        newOrder.State = OrderState.Open;
                    }

                    return newOrder;
                }
                else if (status == HttpStatusCode.InternalServerError)
                {
                    //(int code, string message) errorInfo = JsonConvert.DeserializeObject<(int, string)>(operationResult);

                    dynamic errorInfo = JsonConvert.DeserializeObject(operationResult);

                    // отправить сообщение об ошибке в лог
                    if (errorInfo.code == 100)
                    {
                        // ошибка идентификации пользователя на бирже
                        return null;
                    }
                    else if (errorInfo.code == 110)
                    {
                        // Не достаточно средств для выставления ордера
                        return null;
                    }
                    else if (errorInfo.code == 120)
                    {
                        // Ошибка в параметрах ордера
                        return null;
                    }
                }
                return null;
            }
            catch(Exception e)
            {
                throw;
            }            
        }

        /// <summary>
        /// отменить ордер
        /// </summary>        
        public static async Task<bool> CancelOrder(Client clientInfo, Order signal)
        {
            var orderResult = await SendRequest("CancelOrder", clientInfo, signal);

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
        public static async Task<bool> CheckOrderStatus(Client clientInfo, Order signal)
        {
            var orderResult = await SendRequest("CheckOrder", clientInfo, signal);

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
