
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace CpzTrader
{
    public static class TradersManager
    {
        [FunctionName("StartTrader")]
        public static async Task Run([EventGridTrigger]EventGridEvent eventGridEvent,
            [OrchestrationClient] DurableOrchestrationClient client)
        {
            if (eventGridEvent.EventType == "CPZ.Tasks.Trader.Start")
            {
                var id = await client.StartNewAsync("Trader", eventGridEvent.Data);
            }
        }

        public static async Task<HttpResponseMessage> Run(
        HttpRequestMessage req,
        DurableOrchestrationClient starter,
        string functionName,
        ILogger log)
        {
            // Function input comes from the request content.
            dynamic eventData = await req.Content.ReadAsAsync<object>();
            string instanceId = await starter.StartNewAsync(functionName, eventData);

            log.LogInformation($"Started orchestration with ID = '{instanceId}'.");

            var res = starter.CreateCheckStatusResponse(req, instanceId);
            res.Headers.RetryAfter = new RetryConditionHeaderValue(TimeSpan.FromSeconds(10));
            return res;
        }
    }
}
