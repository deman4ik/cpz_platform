using CPZMarketWatcher.Models;
using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using System;
using System.Net;
using System.Net.Http;

namespace CPZMarketWatcher.Controllers
{
    [Produces("application/json")]
    [Route("api/GetStatus")]
    public class StatusHandler : Controller
    {
        private ProviderManager _manager;

        public StatusHandler(ProviderManager manager)
        {
            _manager = manager;
        }

        [HttpPost]   
        public JsonResult GetStatus([FromBody]object request)
        {
            try
            {
                EventGridSubscriber eventGridSubscriber = new EventGridSubscriber();
                //eventGridSubscriber.AddOrUpdateCustomEventMapping(EventGridEventTypes.Subscribe, typeof(OrderToProvider));
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
                            return Json(responseData);
                        }
                        else
                        {
                            // Считываем данные
                            var eventData = (OrderToProvider)eventGridEvent.Data;

                            // Получить информацию о поставщике по идентификатору
                            if (eventGridEvent.EventType == EventGridEventTypes.GetStatusById)
                            {
                                var info = _manager.TakeActiveProviderByName(eventData.NameProvider);
                                return Json(info);
                            }
                            // Получить информацию обо всех поставщиках
                            else if (eventGridEvent.EventType == EventGridEventTypes.GetStatusAll)
                            {
                                var info = _manager.TakeAllActiveProviders();
                                return Json(info);
                            }
                        }
                    }
                    return Json(new HttpResponseMessage(HttpStatusCode.OK));
                }
                else
                {
                    return Json(new HttpResponseMessage(HttpStatusCode.Forbidden));
                }
            }
            catch (Exception e)
            {
                throw;
            }

        }        
    }
}
