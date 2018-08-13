
using CPZMarketWatcher.Models;
using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;


namespace CPZMarketWatcher.Controllers
{
    [Produces("application/json")]
    public class EventGridEventHandlerController : Controller
    {
        private ProviderManager _manager;

        public EventGridEventHandlerController(ProviderManager manager)
        {
            _manager = manager;
        }

        [HttpPost]
        [Route("api/EventGridEventHandler")]
        public async Task<JObject> Post([FromBody]object request)
        {
            try
            {
                const string customTopicEvent = "CPZ.Ticks.NewTick";
                EventGridSubscriber eventGridSubscriber = new EventGridSubscriber();
                eventGridSubscriber.AddOrUpdateCustomEventMapping(customTopicEvent, typeof(OrderToProvider));
                EventGridEvent[] eventGridEvents = eventGridSubscriber.DeserializeEventGridEvents(request.ToString());

                var queryKey = HttpContext.Request.Query["key"];

                var secretKey = Environment.GetEnvironmentVariable("API_KEY");

                if (!string.IsNullOrEmpty(queryKey) && queryKey == secretKey)
                {
                    foreach (EventGridEvent eventGridEvent in eventGridEvents)
                    {
                        // Если пришел запрос на валидацию 
                        if (eventGridEvent.EventType == EventGridEventTypes.SubscriptionValidationEvent)
                        {
                            var eventData = (SubscriptionValidationEventData)eventGridEvent.Data;

                            var responseData = new SubscriptionValidationResponse()
                            {
                                ValidationResponse = eventData.ValidationCode
                            };

                            // Возвращаем полученный код валидации
                            return new JObject(responseData);
                        }
                        else
                        {
                            // Считываем данные
                            var eventData = (OrderToProvider)eventGridEvent.Data;

                            // Если пришел запрос на запуск новой пары
                            if (eventGridEvent.EventType == EventGridEventTypes.Subscribe)
                            {
                                await _manager.SubscribeNewPaperAsync(eventData);
                            }
                            // Если пришел запрос на остановку получения данных по определенной паре
                            else if (eventGridEvent.EventType == EventGridEventTypes.Unsubscribe)
                            {
                                _manager.UnsubscribePair(eventData);
                            }
                            // Если пришел запрос на остановку поставщика
                            else if (eventGridEvent.EventType == EventGridEventTypes.Stop)
                            {
                                _manager.RemoveProvider(eventData.NameProvider);
                            }
                        }
                    }

                    return new JObject(new HttpResponseMessage(HttpStatusCode.OK));
                }
                else
                {
                    return new JObject(new HttpResponseMessage(HttpStatusCode.Forbidden));
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
            
        }        
    }
}