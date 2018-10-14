using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    /// <summary>
    /// свеча
    /// </summary>
    public class Candle
    {
        [JsonProperty("time")]
        public decimal Time { get; set; }

        [JsonProperty("open")]
        public decimal Open { get; set; }

        [JsonProperty("close")]
        public decimal Close { get; set; }

        [JsonProperty("high")]
        public decimal Higt { get; set; }

        [JsonProperty("low")]
        public decimal Low { get; set; }

        [JsonProperty("volume")]
        public decimal Volume { get; set; }
    }
}
