/*
 * https://github.com/Azure-Samples/event-grid-node-publish-consume-events/tree/master/EventGridConsumer/EventGridFunction
 */
 
module.exports = function (context, req) {
    const SubscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";
    const CustomTopicEvent = "CPZ.Ticks.TickReceivedEvent";

    var parsedReq = JSON.parse(req['rawBody']);
    context.log('JavaScript HTTP trigger function processed a request.' + JSON.stringify(parsedReq));

    parsedReq.forEach(eventGridEvent => {
        var eventData = eventGridEvent.data; 
        // Deserialize the event data into the appropriate type based on event type using if/elif/else
        if (eventGridEvent.eventType == SubscriptionValidationEvent) {
            context.log('Got SubscriptionValidation event data, validationCode: ' + eventData.validationCode + ', topic: ' + eventGridEvent.topic); 
            context.res = { status: 200, body: {
                    validationResponse: eventData.validationCode}
            };
        } 
         else if (eventGridEvent.eventType == CustomTopicEvent) {
            context.log('Got CPZ.Ticks.TickReceivedEvent event data, item price ' + JSON.stringify(eventData));
        }
    });
    
    context.done();
};