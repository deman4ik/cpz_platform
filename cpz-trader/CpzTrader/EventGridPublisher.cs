﻿using CpzTrader.Models;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CpzTrader
{
    public static class EventGridPublisher
    {
        /// <summary>
        /// опубликовать событие в event grid
        /// </summary>        
        public static async Task PublishEvent(string eventType, Order order)
        {
            try
            {
                string _topicEndpoint = Environment.GetEnvironmentVariable("EgTopicEndpoint");

                var _topicHostname = new Uri(_topicEndpoint).Host;

                string _topicKey = Environment.GetEnvironmentVariable("EgTopicKey");

                var topicCredentials = new TopicCredentials(_topicKey);

                EventGridClient eventGridClient = new EventGridClient(topicCredentials);

                List<EventGridEvent> eventsList = new List<EventGridEvent>();

                for (int i = 0; i < 1; i++)
                {
                    // Формируем данные
                    dynamic data = new JObject();
                    data.number = order.NumberInRobot;
                    data.symbol = order.Symbol;
                    data.time = order.Time;

                    // Создаем новое событие
                    eventsList.Add(new EventGridEvent()
                    {
                        Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                        Subject = $"Ордер номер : {order.NumberInRobot} # бумага : {order.Symbol} # создан : {order.Time}", // тема события
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
                Debug.WriteLine(error);
            }
        }
    }
}