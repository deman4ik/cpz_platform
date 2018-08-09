﻿using CPZMarketWatcher.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CPZMarketWatcher.Services;

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
        /// получить информацию обо всех активных поставщиках
        /// </summary>
        [HttpGet]
        public JsonResult Get()
        {
            var allProvidersInfo = _manager.TakeAllActiveProviders();

            return Json(allProvidersInfo);
        }

        /// <summary>
        /// получить информацию о конкретном поставщике
        /// </summary>
        [HttpGet("{id}", Name = "Get")]
        public JsonResult Get(string id)
        {
            var needProvider = _manager.TakeActiveProviderByName(id);

            if (needProvider != null)
            {
                return Json(needProvider);
            }
            return Json("Not found");
        }

        /// <summary>
        /// запустить импорт данных
        /// </summary>
        [HttpPost]
        public async Task Post([FromBody]OrderToProvider query)
        {
            if (query.ActionType == ActionType.Subscribe)
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
}
