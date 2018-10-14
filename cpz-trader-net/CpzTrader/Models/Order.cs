using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class Order : ICloneable
    {
        /// <summary>
        /// бумага
        /// </summary>
        public string Symbol { get; set; }

        /// <summary>
        /// объем
        /// </summary>
        public decimal Volume { get; set; }

        /// <summary>
        /// исполненный объем
        /// </summary>
        public decimal Executed { get; set; }

        /// <summary>
        /// цена для входа
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// проскальзывание
        /// </summary>
        public decimal Slippage { get; set; }

        /// <summary>
        /// отклонение
        /// </summary>
        public decimal Deviation { get; set; }

        /// <summary>
        /// время выставления ордера
        /// </summary>
        public DateTime Time { get; set; }

        /// <summary>
        /// время создания ордера
        /// </summary>
        public DateTime TimeCreate { get; set; }

        /// <summary>
        /// текущее состояние
        /// </summary>
        public OrderState State { get; set; }

        /// <summary>
        /// направление сделки
        /// </summary>
        public string Direction { get; set; }

        /// <summary>
        /// тип ордера
        /// </summary>
        public OrderType OrderType { get; set; }

        public string Action { get; set; }

        public int Quantity { get; set; }

        /// <summary>
        /// номер ордера присвоенный роботом
        /// </summary>
        public string NumberInRobot { get; set; }

        /// <summary>
        /// номер ордера присвоенный биржей
        /// </summary>
        public string NumberInSystem { get; set; }

        /// <summary>
        /// клонировать ордер
        /// </summary>
        /// <returns></returns>
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
