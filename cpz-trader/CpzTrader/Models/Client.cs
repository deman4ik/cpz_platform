using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;

namespace CpzTrader.Models
{
    /// <summary>
    /// описывает данные клиента, подписанного на робота
    /// </summary>
    class Client : TableEntity
    {
        public Client(string uniqId, string advisorName)
        {
            this.RowKey = uniqId;
            this.PartitionKey = advisorName;
        }

        public Client(){}

        //public string UniqId { get; set; }

        //public string AdvisorName { get; set; }

        public string PublicKey { get; set; }

        public string PrivateKey { get; set; }

        public string TraderId { get; set; }
    }
}
