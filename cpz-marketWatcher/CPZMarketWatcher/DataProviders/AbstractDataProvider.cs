using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CPZMarketWatcher.Models;

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
        
        public abstract void StartReceivingData(StartImportQuery subscribe);
      
    }
}
