using CpzTrader.Models;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
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
                        Utils.RunAsync(HandleSignal(dataObject, log));

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
        public static async Task HandleSignal(JObject dataObject, TraceWriter log)
        {
            try
            {
                var signal = dataObject.ToObject<NewSignal>();

                // �������� ����� � ������ �� ������� ������ ������
                var clients = await DbContext.GetClientsInfoFromDbAsync(signal.AdvisorName);

                string exchange;

                string baseq;

                string quote;

                if(clients != null && clients.Count != 0)
                {
                    exchange = clients[0].RobotSettings.Exchange;

                    baseq = clients[0].RobotSettings.Baseq;

                    quote = clients[0].RobotSettings.Quote;
                }
                else
                {
                    // ������ ������� �� � ����� ������ ��� ��������
                    return;
                }

                var action = signal.Action;

                string partitionKey = Utils.CreatePartitionKey(exchange, baseq, quote);

                if (action == ActionType.Long || action == ActionType.Short)
                {
                    Position newPosition = new Position(signal.NumberPositionInRobot, partitionKey);

                    Order newOrder = Utils.CreateOrder(signal);

                    newOrder.Slippage = signal.Slippage == 0 ? clients[0].RobotSettings.Slippage : signal.Slippage;

                    newOrder.Deviation = signal.Deviation == 0 ? clients[0].RobotSettings.Deviation : signal.Deviation;

                    newPosition.OpenOrders.Add(newOrder);

                    newPosition.State = signal.Type == OrderType.Market ? PositionState.Open : PositionState.Opening;

                    // ���� ����� ��������� ����� �� ����� �� ����� ��� ����� �������������� � ����� ����� ������ ��������� ����� ���������
                    if (signal.Type == OrderType.Market)
                    {
                        await Utils.SendSignalAllTraders(newPosition);
                    }

                    // ��������� � ���������
                    var result = await DbContext.InsertEntity<Position>("Positions", newPosition);
                }
                else
                {
                    // �������� �� ��������� ������� ��� ������� ������ ������
                    Position needPosition = await DbContext.GetEntityById<Position>("Positions", partitionKey, signal.NumberPositionInRobot); // ��������

                    Order newOrder = Utils.CreateOrder(signal);

                    needPosition.CloseOrders.Add(newOrder);

                    needPosition.State = signal.Type == OrderType.Market ? PositionState.Close : PositionState.Closing;

                    // ���� ����� ��������� ����� �� ����� �� ����� ��� ����� �������������� � ����� ����� ������ ��������� ����� ���������
                    if (signal.Type == OrderType.Market)
                    {
                        await Utils.SendSignalAllTraders(needPosition);
                    }

                    // ��������� ����������� ������� � ���������
                    var res = await DbContext.UpdateEntityById<Position>("Positions", partitionKey, signal.NumberPositionInRobot, needPosition);                    
                }               
            }
            catch (Exception e)
            {                
                Debug.WriteLine(e.Message);
                throw;
            }
        }
    }
}
