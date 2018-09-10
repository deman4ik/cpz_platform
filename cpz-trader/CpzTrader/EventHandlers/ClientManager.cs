using CpzTrader.EventHandlers;
using CpzTrader.Models;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using SubscriptionValidationResponse = Microsoft.Azure.EventGrid.Models.SubscriptionValidationResponse;

namespace CpzTrader
{
    public static class ClientManager
    {
        /// <summary>
        /// обработчик событий пришедших от советника
        /// </summary>
        [FunctionName("Trader_HttpStart")]
        public static async Task<HttpResponseMessage> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")]HttpRequestMessage req,
            TraceWriter log)
        {
            try
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

                        Debug.WriteLine("Событие валидации обработано!");
                        
                        return new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent(JsonConvert.SerializeObject(responseData))
                        };
                    }
                    // добавить клиента
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("StartTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        Utils.RunAsync(StartClientHandler(dataObject));

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    } // останавливаем
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("StopTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        Utils.RunAsync(StopClientHandler(dataObject));

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    } // обновить инфо о клиенте
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("UpdateTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        Utils.RunAsync(UpdateClientHandler(dataObject));

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
                throw;
            }            
        }

        /// <summary>
        /// запуск клиента
        /// </summary>
        public static async Task StartClientHandler(JObject dataObject)
        {
            var clientInfo = dataObject.ToObject<Client>();

            // сохраняем в таблицу запись о новом подключенном клиенте
            await DbContext.SaveClientInfoDbAsync(clientInfo);

            string message = $"Клиент с ID {clientInfo.RowKey} подключен к роботу - {clientInfo.PartitionKey}.";

            await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("TraderStarted"), message);
        }

        /// <summary>
        /// остановка клиента
        /// </summary>
        public static async Task StopClientHandler(JObject dataObject)
        {
            var clientInfo = dataObject.ToObject<Client>();

            // сохраняем в таблицу запись об отключении клиента клиенте
            await DbContext.UpdateClientInfoAsync(clientInfo);

            string message = $"Клиент с ID {clientInfo.RowKey} отключен от робота - {clientInfo.PartitionKey}.";

            await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("TraderStopped"), message);
        }

        /// <summary>
        /// обновление клиента
        /// </summary>
        public static async Task UpdateClientHandler(JObject dataObject)
        {
            var clientInfo = dataObject.ToObject<Client>();

            // сохраняем обновленную информацию о клиенте в таблицу
            await DbContext.UpdateClientInfoAsync(clientInfo);

            string message = $"Обновление данных клиента с ID {clientInfo.RowKey}, подключенного к роботу - {clientInfo.PartitionKey}.";

            await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("TraderUpdeted"), message);
        }
    }
}