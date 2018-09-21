using CPZMarketWatcher.Models;
using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Controllers
{
    [Produces("application/json")]
    [Route("api/import")]
    public class ImportController : Controller
    {
        private ProviderManager _manager;

        public ImportController(ProviderManager manager)
        {
            _manager = manager;
        }
      

        /// <summary>
        /// запустить импорт данных
        /// </summary>
        [HttpPost]
        public async Task Post([FromBody]OrderToProvider query)
        {
            try
            {
                if (query != null && ModelState.IsValid)
                {
                    if (query.ActionType == ActionType.Start)
                    {
                        await _manager.StartNewProviderAsync(query.NameProvider, query.TypeDataProvider);
                    }
                    else if (query.ActionType == ActionType.Subscribe)
                    {
                        await _manager.SubscribeNewPaperAsync(query);
                    }
                    else if (query.ActionType == ActionType.Unsubscribe)
                    {
                        _manager.UnsubscribePair(query);
                    }
                    else
                    {
                        _manager.RemoveProvider(query.NameProvider);
                    }
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }
    }
}
