using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    /// <summary>
    /// описывает запрос подключения к бирже и получение данных
    /// </summary>
    public class OrderToProvider
    {
        /// <summary>
        /// тип действия, если Subscribe значит добавить подписку, Remove - удалить поставщика, Unsubscribe - удалить пару
        /// </summary>
        public ActionType ActionType { get; set; }

        /// <summary>
        /// имя поставщика
        /// </summary>
        public string NameProvider { get; set; }

        /// <summary>
        /// тип поставщика данных
        /// </summary>
        public ProvidersType TypeDataProvider { get; set; }

        /// <summary>
        /// название биржи
        /// </summary>
        public string Exchange { get; set; }

        /// <summary>
        /// базовая валюта
        /// </summary>
        public string Baseq { get; set; }

        /// <summary>
        /// котировка валюты
        /// </summary>
        public string Quote { get; set; }

        ///// <summary>
        ///// дата и время начала загрузки в формате UTC ( 2018-03-19T10:00:00Z)
        ///// </summary>
        //public DateTime DateFrom { get; set; }

        ///// <summary>
        ///// дата и время окончания загрузки в формате UTC
        ///// </summary>
        //public DateTime DateTo { get; set; }

        ///// <summary>
        ///// таймфрейм
        ///// </summary>
        //public int Timeframe { get; set; }

        /// <summary>
        /// адрес прокси
        /// </summary>
        public string Proxy { get; set; }
    }
}
