using Newtonsoft.Json;

namespace CpzTrader.Models
{
    public class NewSignal
    {
        /// <summary>
        /// имя робота
        /// </summary>
        [JsonProperty("robotId")]
        public string AdvisorName { get; set; }

        /// <summary>
        /// тип действия сигнала
        /// </summary>
        public ActionType Action { get; set; }

        /// <summary>
        /// цена сделки
        /// </summary>
        public decimal Price { get; set; }

        public string Baseq { get; set; }

        public string Quote { get; set; }


        /// <summary>
        /// тип сделки - по рынку или лимиткой
        /// </summary>
        public OrderType OrderType { get; set; }

        /// <summary>
        /// проскальзывание
        /// </summary>
        public decimal? Slippage { get; set; }

        /// <summary>
        /// отклонение
        /// </summary>
        public decimal? Deviation { get; set; }

        /// <summary>
        /// номер ордера в роботе
        /// </summary>
        [JsonProperty("id")]
        public string NumberOrderInRobot { get; set; }

        /// <summary>
        /// номер позиции в роботе
        /// </summary>
        [JsonProperty("positionId")]
        public string NumberPositionInRobot { get; set; }

    }
}
