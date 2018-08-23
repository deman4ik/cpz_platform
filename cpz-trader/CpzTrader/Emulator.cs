using CpzTrader.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CpzTrader
{
    public static class Emulator
    {
        public static Order SendOrder(NewSignal signal, Client client)
        {
            Order newOrder = new Order()
            {
                NumberInRobot = signal.NumberOrderInRobot,
                Symbol = signal.Baseq + "-" + signal.Quote,
                Price = signal.Price,
                Time = DateTime.UtcNow,
                Volume = client.Volume,
                State = signal.Type == OrderType.Limit ? OrderState.Activ : OrderState.Done,
            };

            return newOrder;
        }
        ///// <summary>
        ///// эмулятор торгов, обрабатывает сигналы отдельного советника, вычисляет результаты
        ///// </summary>
        //[FunctionName("RunEmulator")]
        //public static async Task RunEmulator(
        //    [OrchestrationTrigger] DurableOrchestrationContext context)
        //{
        //    // получаем данные о клиенте аккаунт которого будем обрабатывать
        //    var emulatorInfo = context.GetInput<EmulatorSettings>();

        //    // ждем дальнейших указаний
        //    var newSignal = await context.WaitForExternalEvent<NewSignal>("NewSignal");

        //    // выполняем бизнес логику согласно данным из сигнала
        //    //await context.CallActivityAsync<NewSignal>("Trader_Buy", newSignal);

        //    // обновляем clientInfo

        //    // переходим на следующую итерацию, передавая себе текущее состояние
        //    context.ContinueAsNew(emulatorInfo);
        //}

        ///// <summary>
        ///// инициализирует эмулятор торгов
        ///// </summary>
        ///// <param name="advisorName">имя советника</param>
        //public static List<EmulatorSettings> GetEmulatorInfo(string advisorName)
        //{
        //    List<EmulatorSettings> _emulators = new List<EmulatorSettings>();

        //    for (int i = 0; i < 1; i++)
        //    {
        //        _emulators.Add(new EmulatorSettings(i.ToString(), advisorName)
        //        {
        //            //UniqId = i.ToString(),
        //            AdvisorName = advisorName,    
        //            Slippage = 20,
        //            StartingBalance = 10000
        //        });
        //    }
        //    return _emulators;
        //}

        ///// <summary>
        ///// получить из базы список эмуляторов по имени советника
        ///// </summary>
        ///// <param name="advisorName"></param>
        ///// <returns></returns>
        //public static async Task<TableQuerySegment<EmulatorSettings>> GetEmulatorsInfoFromDb(string advisorName)
        //{
        //    try
        //    {
        //        var cloudStorageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

        //        var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

        //        var table = cloudTableClient.GetTableReference("emulatorsinfo");

        //        // формируем фильтр, чтобы получить клиентов для нужного робота
        //        var query = new TableQuery<EmulatorSettings>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

        //        TableQuerySegment<EmulatorSettings> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

        //        return result;

        //    }
        //    catch (StorageException e)
        //    {
        //        Debug.WriteLine(e);
        //        return null;
        //    }

        //    catch (Exception e)
        //    {
        //        Debug.WriteLine(e);
        //        throw;
        //    }
        //}
    }
}
