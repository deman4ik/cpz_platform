export interface AnyObject {
  [key: string]: any;
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
  type ExchangeName = Exchange;
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
  type ValidTimeframe = Timeframe;
  const enum Queue {
    importCandles = "importCandles"
  }
  type QueueName = Queue;

  const enum ImportSubQueue {
    current = "current",
    history = "history"
  }

  interface AssetSymbol {
    exchange: ExchangeName;
    asset: string;
    currency: string;
  }

  interface CandleParams extends AssetSymbol {
    timeframe: ValidTimeframe;
  }

  interface CandlesFetchParams extends CandleParams {
    dateFrom: string;
    limit: number;
  }

  interface TradesFetchParams extends AssetSymbol {
    dateFrom: string;
  }

  interface ExchangeCandle extends AssetSymbol {
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

  interface ExchangeCandlesInTimeframes {
    [key: number]: ExchangeCandle[];
  }

  interface DBCandle extends AssetSymbol {
    id: string;
    time: number;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    type: CandleTypes;
  }

  interface ExchangePrice extends AssetSymbol {
    time: number;
    timestamp: string;
    price: number;
  }

  interface ExchangeTrade extends ExchangePrice {
    amount: number;
    side: string;
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
