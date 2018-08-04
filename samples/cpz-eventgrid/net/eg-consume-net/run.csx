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
            const string CustomTopicEvent = "CPZ.Ticks.TickReceivedEvent";

            string requestContent = await req.Content.ReadAsStringAsync();
            log.Info($"Received events: {requestContent}");

            EventGridSubscriber eventGridSubscriber = new EventGridSubscriber();
            eventGridSubscriber.AddOrUpdateCustomEventMapping(CustomTopicEvent, typeof(CPZTicksReceivedEventData));
            EventGridEvent[] eventGridEvents = eventGridSubscriber.DeserializeEventGridEvents(requestContent);

            foreach (EventGridEvent eventGridEvent in eventGridEvents)
            {
                if (eventGridEvent.Data is SubscriptionValidationEventData)
                {
                    var eventData = (SubscriptionValidationEventData)eventGridEvent.Data;
                    log.Info($"Got SubscriptionValidation event data, validationCode: {eventData.ValidationCode},  validationUrl: {eventData.ValidationUrl}, topic: {eventGridEvent.Topic}");
                    // Do any additional validation (as required) such as validating that the Azure resource ID of the topic matches
                    // the expected topic and then return back the below response
                    var responseData = new SubscriptionValidationResponse()
                    {
                        ValidationResponse = eventData.ValidationCode
                    };

                    return req.CreateResponse(HttpStatusCode.OK, responseData);
                }
                else if (eventGridEvent.Data is CPZTicksReceivedEventData)
                {
                    var eventData = (CPZTicksReceivedEventData)eventGridEvent.Data;
                    log.Info($"Got CPZTicksReceived event data, price {eventData.Price}");
                }
            }

            return req.CreateResponse(HttpStatusCode.OK, response);
}
