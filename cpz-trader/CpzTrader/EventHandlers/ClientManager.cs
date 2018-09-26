using CpzTrader.EventHandlers;
using CpzTrader.Models;
using CpzTrader.Services;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
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
        public static async Task<HttpResponseMessage> HttpStart([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "taskEvents")]HttpRequestMessage req, TraceWriter log)
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

                    IList<string> errorMessages;

                    // В зависимости от типа события выполняем определенную логику
                    // валидация
                    if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("SubscriptionValidationEvent"), StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<SubscriptionValidationEventData>();
                        
                        var responseData = new SubscriptionValidationResponse();

                        responseData.ValidationResponse = eventData.ValidationCode;
                        
                        return new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent(JsonConvert.SerializeObject(responseData))
                        };
                    }
                    // добавить клиента
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("StartTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        // проверить пришедшие данные на валидность
                        var isValid = Validator.CheckDataForClientManager("start",dataObject, out errorMessages);

                        if(isValid)
                        {
                            // добавить клиента в хранилище
                            Utils.RunAsync(StartClientHandler(eventGridEvent.Subject, dataObject));
                        }
                        else
                        {
                            // создаем и заполняем объект ошибки валидации
                            dynamic validationError = new JObject();

                            validationError.code = ErrorCodes.ClientData;
                            validationError.message = "Data Validation Error on Receiving a Client Start Request";

                            dynamic details = new JObject();

                            details.input = dataObject;
                            details.taskId = dataObject.GetValue("taskId");
                            details.internalError = JsonConvert.SerializeObject(errorMessages);

                            validationError.details = details;

                            await EventGridPublisher.PublishEventInfo(eventGridEvent.Subject, ConfigurationManager.TakeParameterByName("TraderError"), validationError);
                        }
                        
                    } // останавливаем
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("StopTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        // проверить пришедшие данные на валидность
                        var isValid = Validator.CheckDataForClientManager("stop", dataObject, out errorMessages);

                        if (isValid)
                        {
                            // отключить клиента
                            Utils.RunAsync(StopClientHandler(eventGridEvent.Subject, dataObject));
                        }
                        else
                        {
                            dynamic validationError = new JObject();

                            validationError.code = ErrorCodes.ClientData;
                            validationError.message = "Data validation error when receiving a request to stop the client";

                            dynamic details = new JObject();

                            details.input = dataObject;
                            details.taskId = dataObject.GetValue("taskId");
                            details.internalError = JsonConvert.SerializeObject(errorMessages);

                            validationError.details = details;

                            await EventGridPublisher.PublishEventInfo(eventGridEvent.Subject, ConfigurationManager.TakeParameterByName("TraderError"), validationError);
                        }
                        
                    } // обновить инфо о клиенте
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("UpdateTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        // проверить пришедшие данные на валидность
                        var isValid = Validator.CheckDataForClientManager("update", dataObject, out errorMessages);

                        if (isValid)
                        {
                            // обновить информацию о клиенте в хранилище
                            Utils.RunAsync(UpdateClientHandler(eventGridEvent.Subject, dataObject));
                        }
                        else
                        {
                            dynamic validationError = new JObject();

                            validationError.code = ErrorCodes.ClientData;
                            validationError.message = "Data Validation Error When Retrieving a Client Update Request";

                            dynamic details = new JObject();

                            details.input = dataObject;
                            details.taskId = dataObject.GetValue("taskId");
                            details.internalError = JsonConvert.SerializeObject(errorMessages);

                            validationError.details = details;
                            
                            await EventGridPublisher.PublishEventInfo(eventGridEvent.Subject, ConfigurationManager.TakeParameterByName("TraderError"), validationError);
                        }                        
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                throw;
            }            
        }

        /// <summary>
        /// запуск клиента
        /// </summary>
        public static async Task StartClientHandler(string subject, dynamic dataObject)
        {
            try
            {
                Client clientInfo = Utils.CreateClient(dataObject);               

                clientInfo.Status = "started";

                clientInfo.ObjectToJson();

                // сохраняем в таблицу запись о новом подключенном клиенте
                await DbContext.InsertEntity<Client>("Traders", clientInfo);

                string message = $"Клиент с ID {clientInfo.RowKey} подключен к роботу - {clientInfo.PartitionKey}.";

                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderStarted"), dataObject.taskId.ToString(), message);
            }
            catch(Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.taskId.ToString(), e);
                await Log.SendLogMessage(e.Message);
            }            
        }

        /// <summary>
        /// остановка клиента
        /// </summary>
        public static async Task StopClientHandler(string subject, dynamic dataObject)
        {
            try
            {
                var clientInfo = dataObject.ToObject<dynamic>();

                Client needClient = await DbContext.GetEntityById<Client>("Traders", clientInfo.robotId.ToString(), clientInfo.taskId.ToString());

                if (needClient != null)
                {
                    needClient.Status = "stopped";

                    // сохраняем в таблицу запись об отключении клиента
                    await DbContext.UpdateEntityById<Client>("Traders", needClient.PartitionKey, needClient.RowKey, needClient);

                    string message = $"Клиент с ID {needClient.RowKey} отключен от робота - {needClient.PartitionKey}.";

                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderStopped"), dataObject.taskId.ToString(), message);
                }
                else
                {
                    string message = $"Kлиент с ID {clientInfo.taskId} не найден.";
                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.taskId.ToString(), message);
                }                    
            }
            catch (Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.taskId.ToString(), e.Message);
                await Log.SendLogMessage(e.Message);
            }
        }

        /// <summary>
        /// обновление клиента
        /// </summary>
        public static async Task UpdateClientHandler(string subject, dynamic dataObject)
        {
            try
            {
                var clientInfo = (dynamic)dataObject;

                // находим клиента которого нужно обновить
                Client needClient = await DbContext.GetEntityById<Client>("Traders", clientInfo.robotId.ToString(), clientInfo.taskId.ToString());

                if(needClient != null)
                {
                    needClient.JsonToObject();

                    needClient.RobotSettings.Slippage = clientInfo.settings.slippageStep;

                    needClient.RobotSettings.Volume = clientInfo.settings.volume;

                    needClient.ObjectToJson();

                    // сохраняем в таблицу запись об обновлении клиента
                    await DbContext.UpdateEntityById<Client>("Traders", needClient.PartitionKey, needClient.RowKey, needClient);

                    // публикуем в эвентгрид информацию об успешной операции
                    string message = $"Обновление данных клиента с ID {needClient.RowKey}, подключенного к роботу - {needClient.PartitionKey}.";
                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderUpdeted"), dataObject.taskId.ToString(), message);
                }
                else
                {
                    string message = $"Kлиент с ID {clientInfo.taskId} не найден.";
                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.taskId.ToString(), message);
                }
                
            }
            catch (Exception e)
            {
                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderError"), dataObject.taskId.ToString(), e.Message);
                await Log.SendLogMessage(e.Message);
            }
        }
    }
}