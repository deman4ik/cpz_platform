using CPZMarketWatcher.Models;
using System.Collections.Generic;

namespace CPZMarketWatcher.DataProviders
{
    /// <summary>
    /// абстрактный класс поставщика данных, заставит всех поставщиков придерживаться общего интерфейса
    /// </summary>
    public abstract class AbstractDataProvider
    {
        /// <summary>
        /// имя поставщика данных
        /// </summary>
        public string Name { get; set; }

        protected AbstractDataProvider(string name)
        {
            Name = name;
        }

        public abstract List<OrderToProvider> SubscribedPairs { get; set; }

        public abstract void StartReceivingData(OrderToProvider subscribe);

        public abstract void StopReceivingData();

        public abstract void UnsubscribePair(OrderToProvider subscribe);

    }
}
