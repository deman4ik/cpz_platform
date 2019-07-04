export namespace global {
  interface AnyObject {
    [key: string]: any;
  }
}

export namespace cpz {
  type ExchangeName = "bitfinex" | "kraken";

  const enum CandleType {
    loaded = "loaded",
    created = "created",
    previous = "previous"
  }
  interface AssetCred {
    exchange: ExchangeName;
    asset: string;
    currency: string;
  }

  interface CandleParams {
    exchange: ExchangeName;
    asset: string;
    currency: string;
    timeframe: number;
  }

  interface ExchangeCandle {
    exchange: ExchangeName;
    asset: string;
    currency: string;
    timeframe: number;
    time: number;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    type: CandleType;
  }

  interface ExchangePrice {
    exchange: ExchangeName;
    asset: string;
    currency: string;
    time: number;
    timestamp: string;
    price: number;
  }

  interface ExchangeTimeframes {
    [key: string]: number;
  }
}
