using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    public class SubMsg
    {
        public string sid { get; set; }
        public List<object> upgrades { get; set; }
        public int pingInterval { get; set; }
        public int pingTimeout { get; set; }
    }

}
