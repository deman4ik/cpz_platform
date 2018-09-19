using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class Position : TableEntity, ICloneable
    {
        public Position(string uniqId, string partitionKey) : this ()
        {
            this.RowKey = uniqId;
            this.PartitionKey = partitionKey;
        }

        public Position()
        {
            OpenOrders = new List<Order>();

            CloseOrders = new List<Order>();
        }

        /// <summary>
        /// номер позиции в роботе
        /// </summary>
        public string RobotId { get; set; }

        
        /// <summary>
        /// мультипозиционный ли робот, которому принадлежит позиция
        /// </summary>
        public bool IsMultiPosition { get; set; }

        /// <summary>
        /// ордера открывшие позицию
        /// </summary>
        public List<Order> OpenOrders { get; set; }

        public string OpenOrdersJson { get; set; }

        /// <summary>
        /// ордера закрывшие позицию
        /// </summary>
        public List<Order> CloseOrders { get; set; }

        public string CloseOrdersJson { get; set; }

        /// <summary>
        /// состояние позиции
        /// </summary>
        public int State { get; set; }

        /// <summary>
        /// преобразовать объекты в JSON
        /// </summary>
        public void ObjectToJson()
        {
            this.OpenOrdersJson = JsonConvert.SerializeObject(OpenOrders);
            this.CloseOrdersJson = JsonConvert.SerializeObject(CloseOrders);
        }

        /// <summary>
        /// преобразовать JSON в объекты
        /// </summary>
        public void JsonToObject()
        {
            this.OpenOrders = JsonConvert.DeserializeObject<List<Order>>(OpenOrdersJson);
            this.CloseOrders = JsonConvert.DeserializeObject<List<Order>>(CloseOrdersJson);
        }

        /// <summary>
        /// рассчитать результат по позиции
        /// </summary>        
        public decimal CalculatePositionResult()
        {
            var averageEntryPrice = 0m;

            int openOrdersCount = 0;

            var averageExitPrice = 0m;

            int closeOrdersCount = 0;

            foreach (var order in OpenOrders)
            {
                if(order.State == OrderState.Closed)
                {
                    averageEntryPrice += order.Price;
                    openOrdersCount++;
                }
            }

            var vol = GetOpenVolume();

            var openTotalVolume = 0m;

            if (openOrdersCount != 0 && vol != 0)
            {
                 openTotalVolume = averageEntryPrice / openOrdersCount * vol;
            }

            foreach (var order in CloseOrders)
            {
                if (order.State == OrderState.Closed)
                {
                    averageExitPrice += order.Price;
                    closeOrdersCount++;
                }
            }

            var closeTotalVolume = 0m;

            if (closeOrdersCount != 0 && vol != 0)
            {
                closeTotalVolume = averageExitPrice / closeOrdersCount * vol;
            }
            
            return closeTotalVolume - openTotalVolume;
        }

        /// <summary>
        /// найти ордер по номеру
        /// </summary>
        /// <param name="numberOrder">номер ордера в роботе</param>
        /// <returns></returns>
        public Order GetNeedOrder(string numberOrder)
        {
            var needOrder = OpenOrders.Find(order => order.NumberInRobot == numberOrder);

            if(needOrder == null)
            {
                needOrder = CloseOrders.Find(order => order.NumberInRobot == numberOrder);
            }

            return needOrder;
        }

        /// <summary>
        /// получить кол-во контрактов открытых в этой позиции
        /// </summary>
        /// <returns></returns>
        public decimal GetOpenVolume()
        {
            var openVolume = 0m;

            foreach(var order in OpenOrders)
            {
                if(order.State == OrderState.Closed)
                {
                    openVolume += order.Volume;
                }
            }

            return openVolume;
        }

        /// <summary>
        /// копировать позицию
        /// </summary>
        /// <returns></returns>
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
