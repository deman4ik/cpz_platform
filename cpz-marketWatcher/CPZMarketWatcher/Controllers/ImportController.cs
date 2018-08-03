using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CPZMarketWatcher.DataProviders;
using CPZMarketWatcher.Models;
using CPZMarketWatcher.Servises;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        // GET: api/import
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "Hello", "Import" };
        }

        // GET: api/import/5
        [HttpGet("{id}", Name = "Get")]
        public string Get(int id)
        {
            return "value";
        }
        
        // POST: api/import
        [HttpPost]
        public async Task Post([FromBody]StartImportQuery query)
        {
            var res = query;
            
            await _manager.SubscribeNewPaperAsync(query);
            
                       
        }
        
        // PUT: api/import/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }
        
        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
