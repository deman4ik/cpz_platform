using CpzTrader.EventHandlers;
using CpzTrader.Models;
using CpzTrader.Services;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
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
        public static async Task<HttpResponseMessage> HttpStart([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "taskEvents")]HttpRequestMessage req, ILogger log)
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
                        var isValid = Validator.CheckData("start",dataObject, out errorMessages);

                        if(isValid)
                        {
                            // добавить клиента в хранилище
                            Utils.RunAsync(StartClientHandler(eventGridEvent.Subject, dataObject, log));
                        }
                        else
                        {
                            string message = "Data Validation Error on Receiving a Client Start Request";

                            string internalError = JsonConvert.SerializeObject(errorMessages);

                            // отправить сообщение об ошибке
                            await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), eventGridEvent.Subject, dataObject, internalError);
                        }
                        
                    } // останавливаем
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("StopTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        // проверить пришедшие данные на валидность
                        var isValid = Validator.CheckData("stop", dataObject, out errorMessages);

                        if (isValid)
                        {
                            // отключить клиента
                            Utils.RunAsync(StopClientHandler(eventGridEvent.Subject, dataObject, log));
                        }
                        else
                        {
                            string message = "Data validation error when receiving a request to stop the client";

                            string internalError = JsonConvert.SerializeObject(errorMessages);

                            // отправить сообщение об ошибке
                            await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), eventGridEvent.Subject, dataObject, internalError);
                        }
                        
                    } // обновить инфо о клиенте
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("UpdateTrader"), StringComparison.OrdinalIgnoreCase))
                    {
                        // проверить пришедшие данные на валидность
                        var isValid = Validator.CheckData("update", dataObject, out errorMessages);

                        if (isValid)
                        {
                            // обновить информацию о клиенте в хранилище
                            Utils.RunAsync(UpdateClientHandler(eventGridEvent.Subject, dataObject, log));
                        }
                        else
                        {
                            string message = "Data Validation Error When Retrieving a Client Update Request";

                            string internalError = JsonConvert.SerializeObject(errorMessages);

                            // отправить сообщение об ошибке
                            await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), eventGridEvent.Subject, dataObject, internalError);                            
                        }                        
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                log.LogError(e.Message, e);
                throw;
            }            
        }

        /// <summary>
        /// запуск клиента
        /// </summary>
        public static async Task StartClientHandler(string subject, dynamic dataObject, ILogger log)
        {
            try
            {
                Client clientInfo = Utils.CreateClient(dataObject);               

                clientInfo.Status = "started";

                clientInfo.ObjectToJson();

                var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

                // сохраняем в таблицу запись о новом подключенном клиенте
                await DbContext.InsertEntity<Client>(tableName, clientInfo);

                string message = $"Клиент с ID {clientInfo.RowKey} подключен к роботу - {clientInfo.PartitionKey}.";

                await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderStarted"), dataObject.taskId.ToString(), message);
            }
            catch(StorageException e)
            {
                string message = "Error adding new client to the storage";

                string internalError = e.Message;

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }
            catch(Exception e)
            {
                string message = "An error occurred while connecting a new client";

                string internalError = e.Message;                  
                               
                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }            
        }

        /// <summary>
        /// остановка клиента
        /// </summary>
        public static async Task StopClientHandler(string subject, dynamic dataObject, ILogger log)
        {
            try
            {
                var clientInfo = dataObject.ToObject<dynamic>();

                var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

                Client needClient = await DbContext.GetEntityById<Client>(tableName, clientInfo.robotId.ToString(), clientInfo.taskId.ToString());

                if (needClient != null && needClient.Status != "stopped")
                {
                    needClient.Status = "stopped";

                    // сохраняем в таблицу запись об отключении клиента
                    await DbContext.UpdateEntityById<Client>("Traders", needClient.PartitionKey, needClient.RowKey, needClient);

                    string message = $"Клиент с ID {needClient.RowKey} отключен от робота - {needClient.PartitionKey}.";

                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderStopped"), dataObject.taskId.ToString(), message);
                }
                else
                {
                    string message = $"Kлиент с ID {clientInfo.taskId} не найден или уже со статусом \"stopped\"";
                    await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, dataObject.GetValue("taskId").ToString(), subject, dataObject);
                }                    
            }
            catch (StorageException e)
            {
                string message = "Error updating client status when stopped";

                string internalError = e.Message;

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }
            catch (Exception e)
            {
                string message = "There was an error stopping the client";

                string internalError = e.Message;

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }
        }

        /// <summary>
        /// обновление клиента
        /// </summary>
        public static async Task UpdateClientHandler(string subject, dynamic dataObject, ILogger log)
        {
            try
            {
                var clientInfo = (dynamic)dataObject;

                var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

                // находим клиента которого нужно обновить
                Client needClient = await DbContext.GetEntityById<Client>(tableName, clientInfo.robotId.ToString(), clientInfo.taskId.ToString());

                if(needClient != null)
                {
                    needClient.JsonToObject();

                    needClient.RobotSettings.Slippage = clientInfo.settings.slippageStep;

                    needClient.RobotSettings.Volume = clientInfo.settings.volume;

                    needClient.ObjectToJson();

                    // сохраняем в таблицу запись об обновлении клиента
                    await DbContext.UpdateEntityById<Client>(tableName, needClient.PartitionKey, needClient.RowKey, needClient);

                    // публикуем в эвентгрид информацию об успешной операции
                    string message = $"Обновление данных клиента с ID {needClient.RowKey}, подключенного к роботу - {needClient.PartitionKey}.";
                    await EventGridPublisher.PublishEventInfo(subject, ConfigurationManager.TakeParameterByName("TraderUpdeted"), dataObject.taskId.ToString(), message);
                }
                else
                {
                    string message = $"Kлиент с ID {clientInfo.taskId} не найден.";
                    await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), subject, dataObject);
                }
                
            }
            catch (StorageException e)
            {
                string message = "Error updating client to the storage";

                string internalError = e.Message;

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }
            catch (Exception e)
            {
                string message = "There was an error updating the client";

                string internalError = e.Message;

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.ClientData, message, dataObject.GetValue("taskId").ToString(), subject, dataObject, internalError);
                log.LogError(e.Message, e);
            }
        }
    }
}