using Newtonsoft.Json;

namespace CpzTrader.Models
{
    /// <summary>
    /// настройки робота
    /// </summary>
    public class RobotSettings
    {
        /// <summary>
        /// объем торговли
        /// </summary>
        public decimal Volume { get; set; }

        /// <summary>
        /// проскальзывание
        /// </summary>
        public decimal Slippage { get; set; }

        /// <summary>
        /// отклонение
        /// </summary>
        public decimal Deviation { get; set; }

        /// <summary>
        /// биржа
        /// </summary>
        public string Exchange { get; set; }

        /// <summary>
        /// актив
        /// </summary>
        public string Baseq { get; set; }

        /// <summary>
        /// валюта
        /// </summary>
        public string Quote { get; set; }

        /// <summary>
        /// таймфрейм
        /// </summary>
        public int Timeframe { get; set; }
    }    
}
