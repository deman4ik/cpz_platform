using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CPZMarketWatcher.DataProviders;
using CPZMarketWatcher.Models;

namespace CPZMarketWatcher.Servises
{
    /// <summary>
    /// управляющий поставщиками данных
    /// </summary>
    public class ProviderManager
    {
        public ProviderManager()
        {

        }

        private readonly List<AbstractDataProvider> _allRunningProviders = new List<AbstractDataProvider>();

        /// <summary>
        /// запущенные экземпляры поставщиков
        /// </summary>
        public List<AbstractDataProvider> AllRunningProviders => _allRunningProviders;

        /// <summary>
        /// взять имеющийся или запустить новый экземпляр поставщика данных
        /// </summary>
        /// <param name="uniqName">уникальное имя поставщика</param>
        /// <param name="type">тип поставщика</param>
        /// <returns></returns>
        public async Task<AbstractDataProvider> GetProviderAsync(string uniqName, ProvidersType type)
        {
            AbstractDataProvider provider;

            return await Task.Run(() =>
            {
                provider = AllRunningProviders.Find(prov => prov.Name == uniqName);
           
                if (provider != null)
                {
                    return provider;
                }

                if (type == ProvidersType.CryptoCompare)
                {
                    provider = new CryptoCompareProvider(uniqName);

                    _allRunningProviders.Add(provider);

                    return provider;
                }

                return null;
            });            
        }

        /// <summary>
        /// подписаться на получение данных
        /// </summary>
        public async Task SubscribeNewPaperAsync(StartImportQuery queryMsg)
        {
            AbstractDataProvider needProvider = await GetProviderAsync(queryMsg.NameProvider, queryMsg.TypeDataProvider);
            
            needProvider.StartReceivingData(queryMsg);
        }

    }

    
}
