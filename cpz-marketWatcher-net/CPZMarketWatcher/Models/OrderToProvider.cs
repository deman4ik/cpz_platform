using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

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
        //[JsonProperty(PropertyName = "actionType")]
        public ActionType ActionType { get; set; }

        /// <summary>
        /// имя поставщика
        /// </summary>
        [Required]
        [JsonProperty(PropertyName = "taskId")]
        public string NameProvider { get; set; }

        /// <summary>
        /// тип поставщика данных
        /// </summary>
        [JsonProperty(PropertyName = "providerType")]
        public ProvidersType TypeDataProvider { get; set; }

        /// <summary>
        /// название биржи
        /// </summary>
        [JsonProperty(PropertyName = "exchange")]
        public string Exchange { get; set; }

        /// <summary>
        /// базовая валюта
        /// </summary>
        //[Required]
        [JsonProperty(PropertyName = "asset")]
        public string Asset { get; set; }

        /// <summary>
        /// котировка валюты
        /// </summary>
        //[Required]
        [JsonProperty(PropertyName = "currency")]
        public string Currency { get; set; }

        /// <summary>
        /// адрес прокси
        /// </summary>
        [JsonProperty(PropertyName = "proxy")]
        public string Proxy { get; set; }
    }
}
