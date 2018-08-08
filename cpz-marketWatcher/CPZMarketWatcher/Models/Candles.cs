using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    public class Candle
    {
        public int Time { get; set; }
        public double Close { get; set; }
        public double High { get; set; }
        public double Low { get; set; }
        public double Open { get; set; }
        public double Volumefrom { get; set; }
        public double Volumeto { get; set; }
    }

    public class ConversionType
    {
        public string Type { get; set; }
        public string ConversionSymbol { get; set; }
    }

    public class Candles
    {
        public string Response { get; set; }
        public int Type { get; set; }
        public bool Aggregated { get; set; }
        public List<Candle> Data { get; set; }
        public int TimeTo { get; set; }
        public int TimeFrom { get; set; }
        public bool FirstValueInArray { get; set; }
        public ConversionType ConversionType { get; set; }
    }
}
