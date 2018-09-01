using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

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
        [Required]
        [JsonProperty(PropertyName = "actionType")]
        public ActionType ActionType { get; set; }

        /// <summary>
        /// имя поставщика
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "nameProvider")]
        public string NameProvider { get; set; }

        /// <summary>
        /// тип поставщика данных
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "typeDataProvider")]
        public ProvidersType TypeDataProvider { get; set; }

        /// <summary>
        /// название биржи
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "exchange")]
        public string Exchange { get; set; }

        /// <summary>
        /// базовая валюта
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "baseq")]
        public string Baseq { get; set; }

        /// <summary>
        /// котировка валюты
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "quote")]
        public string Quote { get; set; }

        /// <summary>
        /// адрес прокси
        /// </summary>
        [JsonProperty(PropertyName = "proxy")]
        public string Proxy { get; set; }
    }
}
