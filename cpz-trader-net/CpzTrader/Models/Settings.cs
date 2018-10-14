using Newtonsoft.Json;

namespace CpzTrader.Models
{
    public class Settings
    {
        [JsonProperty("slippageStep")]
        public decimal? SlippageStep { get; set; }

        [JsonProperty("volume")]
        public decimal? Volume { get; set; }

        [JsonProperty("deviation")]
        public decimal? Deviation { get; set; }
    }
}
