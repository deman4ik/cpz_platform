using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace CpzTrader.Models
{
    /// <summary>
    /// описывает данные клиента, подписанного на робота
    /// </summary>
    class Client
    {
        public string UniqId { get; set; }

        public string AdvisorName { get; set; }

        public string PublicKey { get; set; }

        public string PrivateKey { get; set; }

        public Task<string> TraderId { get; set; }
    }
}
