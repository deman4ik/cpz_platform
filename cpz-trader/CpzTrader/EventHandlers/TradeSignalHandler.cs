using CpzTrader.Models;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CpzTrader.EventHandlers
{
    public static class TradeSignalHandler
    {
        /// <summary>
        /// ��������� ������� �� ������
        /// </summary>
        [FunctionName("SignalHandler")]
        public static async Task<HttpResponseMessage> SignalHandler(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")]HttpRequestMessage req,
            TraceWriter log)
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
                    //        Content = new StringContent(JsonConvert.SerializeObject("�� ������ ����"))
                    //    };
                    //}

                    JObject dataObject = eventGridEvent.Data as JObject;

                    // � ����������� �� ���� ������� ��������� ������������ ������
                    // ���������
                    if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("SubscriptionValidationEvent"), StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<SubscriptionValidationEventData>();

                        var responseData = new SubscriptionValidationResponse();

                        responseData.ValidationResponse = eventData.ValidationCode;

                        Debug.WriteLine("������� ��������� ����������!");

                        return new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent(JsonConvert.SerializeObject(responseData))
                        };
                    }
                    // ����� ������                    
                    else if (string.Equals(eventGridEvent.EventType, ConfigurationManager.TakeParameterByName("CpzSignalsNewSignal"), StringComparison.OrdinalIgnoreCase))
                    {
                        Utils.RunAsync(EditSignal(dataObject));

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
                throw;
            }
        }

        /// <summary>
        /// ���������� �������� �� ������
        /// </summary>
        public static async Task EditSignal(JObject dataObject)
        {
            var signal = dataObject.ToObject<NewSignal>();

            // �������� �� ���� �������� � �������� �����������
            List<Client> clients = await DbContext.GetClientsInfoFromDbAsync(signal.AdvisorName);

            List<Task> parallelTraders = new List<Task>();

            if (clients != null)
            {
                // ���������� ���������� ������ ���� ��������������
                foreach (Client client in clients)
                {
                    var parallelTrader = Trader.RunTrader(client, signal);

                    parallelTraders.Add(parallelTrader);
                }

                await Task.WhenAll(parallelTraders);
            }

            string message = $"������ �� ������ - {signal.AdvisorName} ���������.";

            await EventGridPublisher.PublishEventInfo(Environment.GetEnvironmentVariable("SignalHandled"), message);
        }
    }
}
