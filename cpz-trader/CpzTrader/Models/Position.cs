using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class Position
    {
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
        /// найти открывающий ордер по номеру
        /// </summary>
        /// <param name="numberOrder">номер ордера в роботе</param>
        /// <returns></returns>
        public Order GetNeedOpenOrder(string numberOrder)
        {
            var needPrder = OpenOrders.Find(order => order.NumberInRobot == numberOrder);

            return needPrder;
        }

        /// <summary>
        /// найти закрывающий ордер по номеру
        /// </summary>
        /// <param name="numberOrder">номер ордера в роботе</param>
        /// <returns></returns>
        public Order GetNeedCloseOrder(string numberOrder)
        {
            var needPrder = CloseOrders.Find(order => order.NumberInRobot == numberOrder);

            return needPrder;
        }

    }
}
