using System.Collections.Generic;

namespace CPZMarketWatcher.Models
{
    /// <summary>
    /// информация о конкретном поставщике данных
    /// </summary>
    public class ProviderInfo
    {
        /// <summary>
        /// имя
        /// </summary>
        public string Name;

        /// <summary>
        /// пары на которые подписан этот поставщик
        /// </summary>
        public List<string> RunningPairs;

    }
}
