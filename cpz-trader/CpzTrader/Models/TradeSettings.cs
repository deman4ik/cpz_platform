using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class TradeSettings
    {
        public decimal Lot { get; set; }

        public decimal Volume { get; set; }

        public string PublicKey { get; set; }

        public string PrivateKey { get; set; }
    }
}
