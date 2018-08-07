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

        public abstract List<StartImportQuery> SubscribedPairs { get; set; }

        public abstract void StartReceivingData(StartImportQuery subscribe);

    }
}
