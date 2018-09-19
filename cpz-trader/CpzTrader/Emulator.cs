using CpzTrader.Models;
using System;

namespace CpzTrader
{
    /// <summary>
    /// эмулятор торгов
    /// </summary>
    public static class Emulator
    {
        public static Order SendOrder(decimal volume, Order signal)
        {
            signal.State = signal.OrderType == OrderType.Limit ? OrderState.Open : OrderState.Closed;
 
            return signal;
        }

        /// <summary>
        /// проверить хватает ли средств на балансе для совершения сделки
        /// </summary>
        /// <param name="currentBalance">текущий баланс</param>
        /// <param name="price">цена входа</param>
        /// <param name="volume">объем входа</param>
        public static bool CheckBalance(decimal currentBalance, decimal price, decimal volume)
        {
            var currencyVolume = price * volume;
            
            return currencyVolume < currentBalance ? true : false;
        }
    }
}
