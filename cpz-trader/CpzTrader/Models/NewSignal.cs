using Newtonsoft.Json;
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
        [JsonProperty("robot")]
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
        [JsonProperty("asset")]
        public string Baseq { get; set; }

        [JsonProperty("currency")]
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
        /// проскальзывание
        /// </summary>
        public decimal Slippage { get; set; }

        /// <summary>
        /// отклонение
        /// </summary>
        public decimal Deviation { get; set; }

        /// <summary>
        /// номер ордера в роботе
        /// </summary>
        [JsonProperty("id")]
        public string NumberOrderInRobot { get; set; }

        /// <summary>
        /// номер позиции в роботе
        /// </summary>
        [JsonProperty("position")]
        public string NumberPositionInRobot { get; set; }

    }
}
