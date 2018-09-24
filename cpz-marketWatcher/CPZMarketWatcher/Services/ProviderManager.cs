using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using CPZMarketWatcher.DataProviders;
using CPZMarketWatcher.Models;

namespace CPZMarketWatcher.Services
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
        public async Task<AbstractDataProvider> StartNewProviderAsync(string uniqName, ProvidersType type)
        {
            AbstractDataProvider provider;

            return await Task.Run(() =>
            {                
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
        public async Task SubscribeNewPaperAsync(OrderToProvider queryMsg)
        {
            AbstractDataProvider needProvider = AllRunningProviders.Find(prov => prov.Name == queryMsg.NameProvider); //await GetProviderAsync(queryMsg.NameProvider, queryMsg.TypeDataProvider);

            await needProvider.StartReceivingData(queryMsg);
        }

        /// <summary>
        /// получить информацию обо всех активных поставщиках
        /// </summary>
        /// <returns>список активных поставщиков</returns>
        public List<ProviderInfo> TakeAllActiveProviders()
        {
            try
            {
                var allProviders = new List<ProviderInfo>();

                foreach (var abstractDataProvider in AllRunningProviders)
                {
                    var runningPairs = new List<string>();

                    foreach (var startImportQuery in abstractDataProvider.SubscribedPairs)
                    {
                        runningPairs.Add($"{startImportQuery.Exchange}:{startImportQuery.Asset}-{startImportQuery.Currency}");
                    }

                    allProviders.Add(new ProviderInfo()
                    {
                        Name = abstractDataProvider.Name,
                        RunningPairs = runningPairs
                    });
                }

                return allProviders;
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// получить информацию о поставщике по имени
        /// </summary>
        /// <param name="name">имя нужного поставщика</param>
        /// <returns></returns>
        public ProviderInfo TakeActiveProviderByName(string name)
        {
            try
            {
                var needProvider = AllRunningProviders.Find(provider => provider.Name == name);

                if (needProvider == null)
                {
                    return null;
                }

                var runningPairs = new List<string>();

                foreach (var startImportQuery in needProvider.SubscribedPairs)
                {
                    runningPairs.Add($"{startImportQuery.Exchange}:{startImportQuery.Asset}-{startImportQuery.Currency}");
                }

                return new ProviderInfo()
                {
                    Name = needProvider.Name,
                    RunningPairs = runningPairs
                };
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// отписаться от получения данных по конкретной бумаге
        /// </summary>
        /// <param name="queryMsg"></param>
        public void UnsubscribePair(OrderToProvider queryMsg)
        {
            var needProvider = AllRunningProviders.Find(prov => prov.Name == queryMsg.NameProvider);

            if (needProvider != null)
            {
                needProvider.UnsubscribePair(queryMsg);
            }
        }

        /// <summary>
        /// удалить провайдера
        /// </summary>
        /// <param name="name"></param>
        public void RemoveProvider(string name)
        {
            var needProvider = AllRunningProviders.Find(prov => prov.Name == name);

            if (needProvider != null)
            {
                needProvider.StopReceivingData();

                AllRunningProviders.Remove(needProvider);

                needProvider = null;
            }
        }
    }
}
