using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class Order
    {
        public string Symbol { get; set; }

        public decimal Volume { get; set; }

        public decimal Price { get; set; }

        public DateTime Time { get; set; }

        public OrderState State { get; set; }

        public OrderType OrderType { get; set; }

        public string NumberInRobot { get; set; }
    }
}
