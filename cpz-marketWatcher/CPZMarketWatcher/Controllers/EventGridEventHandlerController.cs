
using CPZMarketWatcher.Models;
using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;



namespace CPZMarketWatcher.Controllers
{
    [Produces("application/json")]
    [Route("api/taskEvents")]
    public class EventGridEventHandlerController : Controller
    {
        private ProviderManager _manager;

        public EventGridEventHandlerController(ProviderManager manager)
        {
            _manager = manager;
        }

        [HttpPost]        
        public async Task<JsonResult> Post([FromBody]object request)
        {
            try
            {
                EventGridSubscriber eventGridSubscriber = new EventGridSubscriber();
                
                EventGridEvent[] eventGridEvents = eventGridSubscriber.DeserializeEventGridEvents(request.ToString());

                var queryKey = HttpContext.Request.Query["key"];

                var secretKey = Environment.GetEnvironmentVariable("API_KEY");

                if (!string.IsNullOrEmpty(queryKey) && queryKey == secretKey)
                {
                    foreach (EventGridEvent eventGridEvent in eventGridEvents)
                    {
                        // Если пришел запрос на валидацию 
                        if (eventGridEvent.EventType == ConfigurationManager.TakeParameterByName("SubscriptionValidationEvent"))
                        {
                            var eventData = (SubscriptionValidationEventData)eventGridEvent.Data;

                            var responseData = new SubscriptionValidationResponse()
                            {
                                ValidationResponse = eventData.ValidationCode
                            };

                            // Возвращаем полученный код валидации
                            return Json(responseData);
                        }
                        else
                        {
                            string subject = eventGridEvent.Subject;
                            string topic = ConfigurationManager.TakeParameterByName("CPZ-TASKS");

                            JObject dataObject = eventGridEvent.Data as JObject;
                            // Считываем данные
                            var eventData = dataObject.ToObject<OrderToProvider>(); //(OrderToProvider)eventGridEvent.Data;

                            // Если пришел запрос на запуск поставщика
                            if (eventGridEvent.EventType == ConfigurationManager.TakeParameterByName("Start"))
                            {
                                await _manager.StartNewProviderAsync(eventData.NameProvider, eventData.TypeDataProvider);

                                string eventType = ConfigurationManager.TakeParameterByName("Started");

                                await EventGridPublisher.PublishEvent(topic, eventType, subject, "");
                            }
                            // Если пришел запрос на  получения данных по определенной паре
                            else if (eventGridEvent.EventType == ConfigurationManager.TakeParameterByName("Subscribe"))
                            {
                                await _manager.SubscribeNewPaperAsync(eventData);

                                string eventType = ConfigurationManager.TakeParameterByName("Subscribed");

                                await EventGridPublisher.PublishEvent(topic, eventType, subject, "");
                            }
                            // Если пришел запрос на остановку получения данных по определенной паре
                            else if (eventGridEvent.EventType == ConfigurationManager.TakeParameterByName("Unsubscribe"))
                            {
                                _manager.UnsubscribePair(eventData);

                                string eventType = ConfigurationManager.TakeParameterByName("Unsubscribed");                             

                                await EventGridPublisher.PublishEvent(topic, eventType, subject, "");
                            }
                            // Если пришел запрос на остановку поставщика
                            else if (eventGridEvent.EventType == ConfigurationManager.TakeParameterByName("Stop"))
                            {
                                _manager.RemoveProvider(eventData.NameProvider);

                                string eventType = ConfigurationManager.TakeParameterByName("Stopped");

                                await EventGridPublisher.PublishEvent(topic, eventType, subject, "");
                            }
                        }
                    }
                    return Json(new HttpResponseMessage(HttpStatusCode.OK));
                }
                else
                {
                    string eventType = ConfigurationManager.TakeParameterByName("Log");
                    string topic = ConfigurationManager.TakeParameterByName("CPZ-LOG");

                    dynamic data = new JObject();

                    data.message = "Недействительный ключ";

                    await EventGridPublisher.PublishEvent(topic, eventType, "MARKETWATCHER-KEY-ERROR", data);

                    return Json(new HttpResponseMessage(HttpStatusCode.Forbidden));
                }
            }
            catch (Exception e)
            {
                string eventType = ConfigurationManager.TakeParameterByName("Error");
                string topic = ConfigurationManager.TakeParameterByName("CPZ-LOG");

                await EventGridPublisher.PublishEvent(topic, eventType, "ERROR", (dynamic)e );

                throw;
            }
            
        }        
    }
}