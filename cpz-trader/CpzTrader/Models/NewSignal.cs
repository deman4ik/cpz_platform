using Newtonsoft.Json;
using System;

namespace CpzTrader.Models
{
    public class NewSignal
    {
        /// <summary>
        /// номер сигнала
        /// </summary>
        [JsonProperty("signalId")]
        public string SignalId { get; set; }

        /// <summary>
        /// имя биржи
        /// </summary>
        [JsonProperty("exchange")]
        public string Exchange { get; set; }

        /// <summary>
        /// Base currency
        /// </summary>
        [JsonProperty("asset")]
        public string Asset { get; set; }

        /// <summary>
        /// Quote currency
        /// </summary>
        [JsonProperty("currency")]
        public string Currency { get; set; }

        /// <summary>
        /// Timeframe in minutes
        /// </summary>
        [JsonProperty("timeframe")]
        public string Timeframe { get; set; }

        /// <summary>
        /// Robot uniq Id
        /// </summary>
        [JsonProperty("robotId")]
        public string RobotId { get; set; }

        /// <summary>
        /// Adviser task Id
        /// </summary>
        [JsonProperty("adviserId")]
        public string AdviserId { get; set; }

        /// <summary>
        /// Signal time in seconds
        /// </summary>
        [JsonProperty("alertTime")]
        public DateTime AlertTime { get; set; }

        /// <summary>
        /// Signal type
        /// </summary>
        [JsonProperty("action")]
        public ActionType Action { get; set; }

        /// <summary>
        /// Volume
        /// </summary>
        [JsonProperty("qty")]
        public ActionType Qty { get; set; }

        /// <summary>
        /// Order type - "stop", "limit", "market"
        /// </summary>
        [JsonProperty("orderType")]
        public OrderType OrderType { get; set; }

        /// <summary>
        /// Price in quote currency
        /// </summary>
        [JsonProperty("price")]
        public decimal Price { get; set; }

        /// <summary>
        /// Candle field
        /// </summary>
        [JsonProperty("priceSource")]
        public decimal PriceSource { get; set; }

        /// <summary>
        /// Uniq position Id
        /// </summary>
        [JsonProperty("positionId")]
        public string PositionId { get; set; }

        /// <summary>
        /// Signal from Candle
        /// </summary>
        [JsonProperty("candle")]
        public Candle Candle { get; set; }

        /// <summary>
        /// Trader parameters
        /// </summary>
        [JsonProperty("settings")]
        public Settings Settings { get; set; }
    }
}
