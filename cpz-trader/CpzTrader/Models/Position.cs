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
    }
}
