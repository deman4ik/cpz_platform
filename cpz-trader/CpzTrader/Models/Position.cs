using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class Position
    {
        public Position()
        {
            OpenOrders = new List<Order>();

            CloseOrders = new List<Order>();
        }

        /// <summary>
        /// номер позиции в роботе
        /// </summary>
        public string NumberPositionInRobot { get; set; }

        /// <summary>
        /// ордера открывшие позицию
        /// </summary>
        public List<Order> OpenOrders { get; set; }

        /// <summary>
        /// ордера закрывшие позицию
        /// </summary>
        public List<Order> CloseOrders { get; set; }

        /// <summary>
        /// состояние позиции
        /// </summary>
        public PositionState State { get; set; }
        
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
                if(order.State == OrderState.Done)
                {
                    averageEntryPrice += order.Price;
                    openOrdersCount++;
                }
            }

            var openTotalVolume = averageEntryPrice / openOrdersCount * GetOpenVolume();

            foreach (var order in CloseOrders)
            {
                if (order.State == OrderState.Done)
                {
                    averageExitPrice += order.Price;
                    closeOrdersCount++;
                }
            }

            var closeTotalVolume = averageExitPrice / closeOrdersCount * GetOpenVolume();

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
                if(order.State == OrderState.Done)
                {
                    openVolume += order.Volume;
                }
            }

            return openVolume;
        }
    }
}
