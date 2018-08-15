using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    public class NewSignal
    {
        public string AdvisorName { get; set; }

        public string Direction { get; set; }

        public string Exchange { get; set; }

        public string Baseq { get; set; }

        public string Quote { get; set; }
    }
}
