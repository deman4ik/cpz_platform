using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    public class SubMsg
    {
        public string Sid { get; set; }
        public List<object> Upgrades { get; set; }
        public int PingInterval { get; set; }
        public int PingTimeout { get; set; }
    }

}
