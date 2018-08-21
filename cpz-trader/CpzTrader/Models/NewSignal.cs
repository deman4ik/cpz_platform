using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class NewSignal
    {
        /// <summary>
        /// имя робота
        /// </summary>
        public string AdvisorName { get; set; }

        /// <summary>
        /// направление сделки
        /// </summary>
        public string Direction { get; set; }

        /// <summary>
        /// биржа
        /// </summary>
        public string Exchange { get; set; }

        /// <summary>
        /// базовая валюта
        /// </summary>
        public string Baseq { get; set; }

        public string Quote { get; set; }

        /// <summary>
        /// тип действия сигнала
        /// </summary>
        public ActionType Action { get; set; }

        /// <summary>
        /// цена сделки
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// объем
        /// </summary>
        public decimal Volume { get; set; }

        /// <summary>
        /// тип сделки - по рынку или лимиткой
        /// </summary>
        public OrderType Type { get; set; }

        /// <summary>
        /// номер ордера в роботе
        /// </summary>
        public string NumberOrderInRobot { get; set; }

    }
}
