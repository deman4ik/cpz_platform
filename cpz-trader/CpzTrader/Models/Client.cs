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
    public class Client : TableEntity
    {
        public Client(string uniqId, string advisorName)
        {
            this.RowKey = uniqId;
            this.PartitionKey = advisorName;
            AllPositions = new List<Position>();
        }

        public Client(){}

        public bool IsEmulation { get; set; }

        public EmulatorSettings EmulatorSettings { get; set; }

        public TradeSettings TradeSettings { get; set; }

        public List<Position> AllPositions { get; set; }

        public string TraderId { get; set; }

        // test data
        public int CountPositions { get; set; }
        
        // test data
        public int CountOpenOrders { get; set; }

        // test data
        public int CountCloseOrders { get; set; }
    }
}
