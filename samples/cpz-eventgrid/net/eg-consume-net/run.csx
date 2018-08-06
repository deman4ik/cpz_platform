/*
 * https://github.com/Azure-Samples/event-grid-dotnet-publish-consume-events/tree/master/EventGridConsumer/EventGridConsumer
 */

//#r "Newtonsoft.Json"
//#r "Microsoft.Azure.EventGrid"

using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;

class CPZTicksReceivedEventData
{
    [JsonProperty(PropertyName = "price")]
    public double Price { get; set; }
}

public static IActionResult Run(HttpRequest req, ILogger log)
{

    log.Info($"C# HTTP trigger function begun");
            string response = string.Empty;
            const string CustomTopicEvent = "CPZ.Ticks.NewTick";

            string requestContent = await req.Content.ReadAsStringAsync();
            log.Info($"Received events: {requestContent}");

            EventGridSubscriber eventGridSubscriber = new EventGridSubscriber();
            eventGridSubscriber.AddOrUpdateCustomEventMapping(CustomTopicEvent, typeof(CPZTicksReceivedEventData));
            EventGridEvent[] eventGridEvents = eventGridSubscriber.DeserializeEventGridEvents(requestContent);

            foreach (EventGridEvent eventGridEvent in eventGridEvents)
            {
                // Если пришел запрос на валидацию 
                if (eventGridEvent.Data is SubscriptionValidationEventData)
                {
                    var eventData = (SubscriptionValidationEventData)eventGridEvent.Data;
                    log.Info($"Got SubscriptionValidation event data, validationCode: {eventData.ValidationCode},  validationUrl: {eventData.ValidationUrl}, topic: {eventGridEvent.Topic}");
                    // TODO: any additional validation (as required) such as validating that the Azure resource ID of the topic matches
                    // TODO: the expected topic and then return back the below response
                    var responseData = new SubscriptionValidationResponse()
                    {
                        ValidationResponse = eventData.ValidationCode
                    };
                    // Возвращаем полученный код валидации
                    return req.CreateResponse(HttpStatusCode.OK, responseData);
                }
                // Если пришел запрос с нужным форматом данных
                else if (eventGridEvent.Data is CPZTicksReceivedEventData)
                {
                    // Считываем данные
                    var eventData = (CPZTicksReceivedEventData)eventGridEvent.Data;
                    log.Info($"Got CPZTicksReceived event data, price {eventData.Price}");
                }
            }
            // При успехе всегда возвращаем 200
            return req.CreateResponse(HttpStatusCode.OK, response);
}
