/*
 * https://github.com/Azure-Samples/event-grid-dotnet-publish-consume-events/tree/master/EventGridPublisher/EventGridPublisher
 */
// Загрузка зависимостей для dotnet script 
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
        // Считывание локальных настроек из json файла
        var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("local.settings.json");
        // Считывание значений настроек
       IConfiguration Configuration = builder.Build();
       string topicEndpoint = Configuration["EG_TOPIC_ENDPOINT"];
       string topicKey = Configuration["EG_TOPIC_KEY"];
        // Список отправляемых событий
       List<EventGridEvent> eventsList = new List<EventGridEvent>();

            for (int i = 0; i < 1; i++)
            {
                // Формируем данные
                dynamic data = new JObject();
                data.price = 100500;
                // Создаем новое событие
                eventsList.Add(new EventGridEvent()
                {
                    Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                    Subject = "Bitfinex#BTC/USD", // тема события
                    DataVersion = "1.0", // версия данных
                    EventType = "CPZ.Ticks.NewTick", // тип события
                    Data = data, // данные события
                    EventTime = DateTime.Now // время формирования события
                });
            }
            // Адрес темы EventGrid
            string topicHostname = new Uri(topicEndpoint).Host;
            // Формирование объекта прав доступа к сервису
            TopicCredentials topicCredentials = new TopicCredentials(topicKey);
            // Клиент EventGrid
            EventGridClient client = new EventGridClient(topicCredentials);
            // Отправка событий в тему
            client.PublishEventsAsync(topicHostname, eventsList).GetAwaiter().GetResult();
            Console.Write("Published events to Event Grid.");
}

Run();