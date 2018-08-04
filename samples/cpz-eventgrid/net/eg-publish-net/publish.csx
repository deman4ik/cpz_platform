/*
 * https://github.com/Azure-Samples/event-grid-dotnet-publish-consume-events/tree/master/EventGridPublisher/EventGridPublisher
 */
 
#r "nuget: Microsoft.Azure.EventGrid, 1.4.0"
#r "nuget: Microsoft.Extensions.Configuration, 2.1.1"
#r "nuget: Microsoft.Extensions.Configuration.Json, 2.1.1"
#r "nuget: Newtonsoft.Json, 11.0.2"

using System;
using System.IO;
using System.Threading;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static async Task Run()
{

        var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("local.settings.json");

       IConfiguration Configuration = builder.Build();
       string topicEndpoint = Configuration["EG_TOPIC_ENDPOINT"];
       string topicKey = Configuration["EG_TOPIC_KEY"];

       List<EventGridEvent> eventsList = new List<EventGridEvent>();

            for (int i = 0; i < 1; i++)
            {
                dynamic data = new JObject();
                data.price = 100500;
                eventsList.Add(new EventGridEvent()
                {
                    Id = Guid.NewGuid().ToString(),
                    Subject = "CPZ.Tick",
                    DataVersion = "1.0",
                    EventType = "CPZ.Ticks.TickReceivedEvent",
                    Data = data,
                    EventTime = DateTime.Now
                });
            }

            string topicHostname = new Uri(topicEndpoint).Host;
            TopicCredentials topicCredentials = new TopicCredentials(topicKey);
            EventGridClient client = new EventGridClient(topicCredentials);

            client.PublishEventsAsync(topicHostname, eventsList).GetAwaiter().GetResult();
            Console.Write("Published events to Event Grid.");
}

Run();