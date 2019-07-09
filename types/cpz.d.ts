export namespace global {
  interface AnyObject {
    [key: string]: any;
  }
}

export namespace cpz {
  const enum CandleType {
    loaded = "loaded",
    created = "created",
    previous = "previous"
  }
  type CandleTypes = CandleType;

  const enum TimeUnit {
    minute = "minute",
    hour = "hour",
    day = "day"
  }
  const enum Exchange {
    bitfinex = "bitfinex",
    kraken = "kraken"
  }
  const enum Timeframe {
    "1m" = 1,
    "5m" = 5,
    "15m" = 15,
    "30m" = 30,
    "1h" = 60,
    "2h" = 120,
    "4h" = 240,
    "1d" = 1440
  }

  type ExchangeName = Exchange;
  type ValidTimeframe = Timeframe;

  interface AssetCred {
    exchange: ExchangeName;
    asset: string;
    currency: string;
  }

  interface CandleParams extends AssetCred {
    timeframe: ValidTimeframe;
  }

  interface CandlesFetchParams extends CandleParams {
    dateFrom: string;
    limit: number;
  }

  interface ExchangeCandle {
    exchange: ExchangeName;
    asset: string;
    currency: string;
    timeframe: ValidTimeframe;
    time: number;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    type: CandleTypes;
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
    [key: string]: ValidTimeframe;
  }

  interface TimeframeProps {
    str: string;
    value: ValidTimeframe;
    lower: ValidTimeframe;
    unit: TimeUnit;
    amountInUnit: number;
  }

  interface Timeframes {
    [key: number]: TimeframeProps;
  }
}
