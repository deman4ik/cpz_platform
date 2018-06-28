#r "Microsoft.Azure.WebJobs.Extensions.DurableTask"
#r "Newtonsoft.Json"

#load "../shared/ImportReqResp.csx"
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static async Task Run(DurableOrchestrationContext context, ILogger log)
{
    // Считывание входных параметров
    ImportInput input = context.GetInput<ImportInput>();
    log.LogInformation(input.ToString());
    DateTime dateTo = DateTime.Parse(input.dateTo);
    DateTime timeout = context.CurrentUtcDateTime.AddMilliseconds(input.timeout);
    // Устанавливаем таймаут между запросами
    await context.CreateTimer(timeout, CancellationToken.None);
    // Параметры повторной попытки
    var retryOptions = new RetryOptions(
        firstRetryInterval: TimeSpan.FromMilliseconds(input.timeout),
        backoffCoefficient: 2,
        maxNumberOfAttempts: 5);
    // Вызов функции загрузки свечей
    var result = await context.CallActivityWithRetryAsync<JObject>("LoadOHLC", retryOptions, JsonConvert.SerializeObject(input));
    ImportOutput output = result.ToObject<ImportOutput>();
    //TODO: Save to DATABASE
    log.LogInformation(output.ToString());
    DateTime lastDate = DateTime.Parse(output.lastDate);
    //Если еще не все загрузили
    if (lastDate < dateTo)
    {
        // Устанавливаем новую дату начала загрузки
        input.dateFrom = lastDate.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'");
        // Повторяем заново
        context.ContinueAsNew(input);
    }
}

