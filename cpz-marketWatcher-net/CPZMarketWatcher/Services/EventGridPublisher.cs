using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace CPZMarketWatcher.Services
{
    public static class EventGridPublisher
    {
        /// <summary>
        /// опубликовать событие ордера в event grid
        /// </summary>        
        public static async Task PublishEvent(string eventType, string subject, dynamic data)
        {
            try
            {
                string _topicEndpoint = Environment.GetEnvironmentVariable("EG_TEST_ENDPOINT");

                var _topicHostname = new Uri(_topicEndpoint).Host;

                string _topicKey = Environment.GetEnvironmentVariable("EG_TEST_KEY");

                var topicCredentials = new TopicCredentials(_topicKey);

                EventGridClient eventGridClient = new EventGridClient(topicCredentials);

                List<EventGridEvent> eventsList = new List<EventGridEvent>();

                for (int i = 0; i < 1; i++)
                {                   
                    // Создаем новое событие
                    eventsList.Add(new EventGridEvent()
                    {
                        Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                        Subject = subject, // тема события
                        DataVersion = "1.0", // версия данных
                        EventType = eventType, // тип события
                        Data = data, // данные события
                        EventTime = DateTime.Now // время формирования события                        
                    });
                }

                // Отправка событий в тему
                await eventGridClient.PublishEventsAsync(_topicHostname, eventsList);

            }
            catch (Exception error)
            {

            }
        }     
    }
}
