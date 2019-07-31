export interface AnyObject {
  [key: string]: any;
}

export namespace cpz {
  const enum Service {
    DB_IMPORTERS = "db-importers",
    DB_CANDLES = "db-candles",
    DB_CANDLES_CURRENT = "db-candles-current",
    DB_EXWATCHERS = "db-exwatchers",
    EXWATCHER = "exwatcher",
    IMPORTER_RUNNER = "importer-runner",
    IMPORTER_WORKER = "importer-worker",
    PUBLIC_CONNECTOR = "public-connector"
  }

  const enum Status {
    pending = "pending",
    queued = "queued",
    started = "started",
    stopped = "stopped",
    finished = "finished",
    failed = "failed"
  }
  type Statuses = Status;

  const enum ExwatcherStatus {
    importing = "importing",
    subscribed = "subscribed",
    failed = "failed"
  }
  type ExwatcherStatuses = ExwatcherStatus;

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

  type ImportType = "current" | "history";

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

  interface Candle extends DBCandle {
    timeframe: number;
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

  interface Importer {
    id: string;
    exchange: cpz.ExchangeName;
    asset: string;
    currency: string;
    type: cpz.ImportType;
    params: any;
    status: cpz.Statuses;
    startedAt?: string;
    endedAt?: string;
    error?: any;
  }

  interface Exwatcher {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    status: cpz.ExwatcherStatuses;
    nodeId: string;
    importerId: string;
    error?: any;
  }
}
