
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
    }
}
