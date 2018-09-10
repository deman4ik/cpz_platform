using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CPZMarketWatcher.Models
{
    public enum ProvidersType
    {
        CryptoCompare,
    }

    public enum ActionType
    {
        Start,
        Subscribe,
        Unsubscribe,
        Remove,
    }    
}
