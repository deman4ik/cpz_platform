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
        /// тип сделки - по рынку или лимиткой
        /// </summary>
        public OrderType Type { get; set; }

        /// <summary>
        /// в случае сигнала на закрывающий ордер эта переменная указывает какой объем нужно закрыть. Вычисляется в % от открытого объема в позиции. Если равен 100, значит нужно закрыть всю позицию
        /// </summary>
        public int PercentVolume { get; set; }

        /// <summary>
        /// номер ордера в роботе
        /// </summary>
        public string NumberOrderInRobot { get; set; }

        /// <summary>
        /// номер позиции в роботе
        /// </summary>
        public string NumberPositionInRobot { get; set; }

    }
}
