using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    /// <summary>
    ///  настройки эмулятора
    /// </summary>
    public class EmulatorSettings
    {
        public EmulatorSettings() { }

        public decimal StartingBalance { get; set; }

        public decimal CurrentBalance { get; set; }

        public decimal Slippage { get; set; }

    }
}