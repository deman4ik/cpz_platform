#r "Microsoft.Azure.WebJobs.Extensions.DurableTask"
#r "Newtonsoft.Json"

using System;
using System.IO;
using System.Threading;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static async Task Run(DurableOrchestrationContext context, ILogger log)
{
    try {
    // Считывание входных параметров
    var input = context.GetInput<JObject>();
    double timeout = (double)input["timeout"];
    DateTime timeoutTime = context.CurrentUtcDateTime.AddMilliseconds(timeout);
    // Устанавливаем таймаут между запросами
    await context.CreateTimer(timeoutTime, CancellationToken.None);
    // Параметры повторной попытки
    var retryOptions = new RetryOptions(
        firstRetryInterval: TimeSpan.FromMilliseconds(timeout),
        maxNumberOfAttempts: 1);

    string typeDataProvider = (string)input["typeDataProvider"];
    JToken loadResult = null;
    JToken next = null;
    if (typeDataProvider == "CryptoCompare")
    {
        // Вызов функции загрузки свечей через Crypto Compare
        loadResult = await context.CallActivityWithRetryAsync<JObject>("LoadCandlesCC", retryOptions, JsonConvert.SerializeObject(input));
    }
    else if (typeDataProvider == "CCXT")
    {
        // Вызов функции загрузки свечей через CCXT
        loadResult = await context.CallActivityWithRetryAsync<JObject>("LoadCandlesCCXT", retryOptions, JsonConvert.SerializeObject(input));
    }
    if (loadResult != null)
    {
        // Вызов функции сохранения свечей
        var saveResult = await context.CallActivityWithRetryAsync<JObject>("SaveCandles", retryOptions, JsonConvert.SerializeObject(loadResult));
        // Установка текущего статуса
        context.SetCustomStatus(new
        {
            taskCompleted = loadResult["next"] == null,
            totalDuration = (double)loadResult["status"]["totalDuration"],
            completedDuration = (double)loadResult["status"]["completedDuration"],
            leftDuration = (double)loadResult["status"]["leftDuration"],
            percent = (double)loadResult["status"]["percent"]
        });

        // Параметры нового запроса на импорт
        next = loadResult["next"];
    }

    // Если параметры заданы
    if (next != null)
    {
        // Новая итерация с обновленными параметрами
        context.ContinueAsNew(next);
    }
    }
    catch (Exception e)
    {
         log.LogError(e.Message);
         context.SetCustomStatus(new
        {
            taskCompleted = false,
            error = e.Message,
            stack = e.StackTrace
        });
    }
}

