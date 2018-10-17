const PRICES_NEWPRICE = {
  dataSchema: {
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    time: { description: "Trade time in seconds.", type: "number" },
    timestamp: { description: "Candle timestamp in UTC.", type: "datetime" },
    price: { description: "Trade Price.", type: "number" }
  }
};

export { PRICES_NEWPRICE };
