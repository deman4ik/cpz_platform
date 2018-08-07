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
                        runningPairs.Add($"{startImportQuery.Exchange}:{startImportQuery.Baseq}-{startImportQuery.Quote}");
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
                    runningPairs.Add($"{startImportQuery.Exchange}:{startImportQuery.Baseq}-{startImportQuery.Quote}");
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
    }
}
