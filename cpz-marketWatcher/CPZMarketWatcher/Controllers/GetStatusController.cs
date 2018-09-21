using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Mvc;

namespace CPZMarketWatcher.Controllers
{
    [Produces("application/json")]
    [Route("api/status")]
    public class StatusHandler : Controller
    {
        private ProviderManager _manager;

        public StatusHandler(ProviderManager manager)
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
    }
}
