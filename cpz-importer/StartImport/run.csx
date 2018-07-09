#r "Microsoft.Azure.WebJobs.Extensions.DurableTask"
#r "Newtonsoft.Json"

using System;
using System.IO;
using System.Threading;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static async Task Run(DurableOrchestrationContext context, ILogger log)
{
    // Считывание входных параметров
    var input = context.GetInput<JObject>();
    double timeout = (double)input["timeout"];
    DateTime timeoutTime = context.CurrentUtcDateTime.AddMilliseconds(timeout);
    // Устанавливаем таймаут между запросами
    await context.CreateTimer(timeoutTime, CancellationToken.None);
    // Параметры повторной попытки
    var retryOptions = new RetryOptions(
        firstRetryInterval: TimeSpan.FromMilliseconds(timeout),
        maxNumberOfAttempts: 5);
    // Вызов функции загрузки свечей
    var loadResult = await context.CallActivityWithRetryAsync<JObject>("LoadOHLC", retryOptions, JsonConvert.SerializeObject(input));
    // Вызов функции сохранения свечей
    var saveResult = await context.CallActivityWithRetryAsync<JObject>("SaveOHLC", retryOptions, JsonConvert.SerializeObject(loadResult));
    // Установка текущего статуса
    context.SetCustomStatus(new
    {
        totalDuration = (double)loadResult["status"]["totalDuration"],
        completedDuration = (double)loadResult["status"]["completedDuration"],
        leftDuration = (double)loadResult["status"]["leftDuration"],
        percent = (double)loadResult["status"]["percent"]
    });

    // Параметры нового запроса на импорт
    var next = loadResult["next"];
    // Если параметры заданы
    if (next != null)
    {
        // Новая итерация с обновленными параметрами
        context.ContinueAsNew(next);
    }
}

