using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Pipes;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CpzTrader.Models;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SubscriptionValidationResponse = Microsoft.Azure.WebJobs.Extensions.EventGrid.SubscriptionValidationResponse;

namespace CpzTrader
{
    public static class Trader
    {
        /// <summary>
        /// �������-�����������, ������������ �������� ������ ���������� �������
        /// </summary>
        [FunctionName("Trader")]
        public static async Task RunOrchestrator(
            [OrchestrationTrigger] DurableOrchestrationContext context)
        {
            // �������� ������ � ������� ������� �������� ����� ������������
            var clientInfo = context.GetInput<Client>();

            // ���� ���������� ��������
            var newSignal = await context.WaitForExternalEvent<NewSignal>("NewSignal");
            
            // ��������� ������ ������ �������� ������ �� �������
            await context.CallActivityAsync<NewSignal>("Trader_Buy", newSignal);

            // ��������� clientInfo

            // ��������� �� ��������� ��������, ��������� ���� ������� ���������
            context.ContinueAsNew(clientInfo);            
        }

        [FunctionName("Trader_Buy")]
        public static string Buy([ActivityTrigger] NewSignal signal, TraceWriter log)
        {
            return $"Hello {signal.AdvisorName}!";
        }

        [FunctionName("Trader_Sell")]
        public static string Sell([ActivityTrigger] NewSignal signal, TraceWriter log)
        {
            return $"Hello {signal.AdvisorName}!";
        }


        /// <summary>
        /// ���������� ������� ��������� �� ���������
        /// </summary>
        [FunctionName("Trader_HttpStart")]
        public static async Task<HttpResponseMessage> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")]HttpRequestMessage req,
            [OrchestrationClient]DurableOrchestrationClient starter,
            TraceWriter log)
        {
            try
            {
                // ������� ��������� ��������
                const string subscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";

                // ������� ������� ��������������
                const string cpzTasksTraderStart = "CPZ.Tasks.Trader.Start";

                // ������� ��������� ������ �������
                const string cpzSignalsNewSignal = "CPZ.Signals.NewSignal";
                

                string requestContent = await req.Content.ReadAsStringAsync();

                EventGridEvent[] eventGridEvents = JsonConvert.DeserializeObject<EventGridEvent[]>(requestContent);

                foreach (EventGridEvent eventGridEvent in eventGridEvents)
                {
                    JObject dataObject = eventGridEvent.Data as JObject;

                    // � ����������� �� ���� ������� ��������� ������������ ������
                    // ���������
                    if (string.Equals(eventGridEvent.EventType, subscriptionValidationEvent, StringComparison.OrdinalIgnoreCase))
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
                    // ������ ��������������
                    else if (string.Equals(eventGridEvent.EventType, cpzTasksTraderStart, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<StartNewTraderData>();

                        List<Client> clients = GetClientsInfo(eventData.AdvisorName);

                        // ��� ������� ������� ��������� ������ ������������� � ��������� ��� ������������� � �������
                        foreach (var client in clients)
                        {
                            Task<string> traderTask = starter.StartNewAsync("Trader", client);

                            client.TraderId = traderTask.Result;                            
                        }

                        // ��������� ����������� �������� � �������
                        await SaveClientsInfoDb(clients);                      

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }
                    // ����� ������
                    else if (string.Equals(eventGridEvent.EventType, cpzSignalsNewSignal, StringComparison.OrdinalIgnoreCase))
                    {
                        var eventData = dataObject.ToObject<NewSignal>();

                        // �������� �� ���� �������� � ����������� ���������
                        TableQuerySegment<Client> clients = GetClientsInfoFromDb(eventData.AdvisorName).Result;

                        List<Task> parallelSignals = new List<Task>();

                        // ���������� ���������� ������ ���� ��������������
                        foreach (var client in clients)
                        {
                            var parallelSignal = starter.RaiseEventAsync(client.TraderId, "NewSignal", eventData);
                            
                            parallelSignals.Add(parallelSignal);
                        }

                        await Task.WhenAll(parallelSignals);

                        return new HttpResponseMessage(HttpStatusCode.OK);
                    }                    
                }
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }            
        }

        /// <summary>
        /// �������������� �������� ��������
        /// </summary>
        /// <param name="advisorName">��� ���������</param>
        private static List<Client> GetClientsInfo(string advisorName)
        {
            List<Client> _clients = new List<Client>();

            for (int i = 0; i < 3; i++)
            {
                _clients.Add(new Client(Guid.NewGuid().ToString(), advisorName)
                {
                    //UniqId = i.ToString(),
                    //AdvisorName = advisorName,
                    PublicKey = "pubKey"+ i,
                    PrivateKey = "prKey" + i
                });               
            }
            return _clients;
        }

        /// <summary>
        /// ��������� ���������� � �������� � ����
        /// </summary>
        /// <param name="clients">������ ��������</param>
        private static async Task SaveClientsInfoDb(List<Client> clients)
        {
            try
            {
                // ������������ � ���������� ���������
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

                // ������� ������ ��� ������ � ���������
                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                // �������� ������ �������
                var table = cloudTableClient.GetTableReference("clientsinfo");

                // ���� ��� ��� �� ���������� - �������
                var res = table.CreateIfNotExistsAsync().Result;

                TableBatchOperation batchOperation = new TableBatchOperation();

                // ��������� ������ �������� � �������
                foreach (var client in clients)
                {
                    batchOperation.Insert(client);
                }

                await table.ExecuteBatchAsync(batchOperation);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }            
        }

        /// <summary>
        /// �������� �� ���� �������� �� ����� ���������
        /// </summary>
        /// <param name="advisorName"></param>
        /// <returns></returns>
        private static async Task<TableQuerySegment<Client>> GetClientsInfoFromDb(string advisorName)
        {
            try
            {
                var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                var table = cloudTableClient.GetTableReference("clientsinfo");

                // ��������� ������, ����� �������� �������� ��� ������� ������
                TableQuery<Client> query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

                var result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                return result;
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }            
        }
    }
}