using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    public class Trade
    {
        /// <summary>
        /// биржа
        /// </summary>
        public string Exchange { get; set; }

        /// <summary>
        /// базовая валюта
        /// </summary>
        public  string Baseq { get; set; }

        /// <summary>
        /// котировка валюты
        /// </summary>
        public string Quote { get; set; }

        /// <summary>
        /// направление трейда
        /// </summary>
        public string Side { get; set; }

        /// <summary>
        /// идентификатор на бирже
        /// </summary>
        public string TradeId { get; set; }

        /// <summary>
        /// время сделки
        /// </summary>
        public DateTime Time { get; set; }

        /// <summary>
        /// объем сделки
        /// </summary>
        public string Volume { get; set; }

        /// <summary>
        /// цена сделки
        /// </summary>
        public string Price { get; set; }
    }
}
