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
    PUBLIC_CONNECTOR = "public-connector",
    ROBOT_RUNNER = "robot-runner",
    ROBOT_WORKER = "robot-worker",
    BACKTESTER_RUNNER = "backtester-runner",
    BACKTESTER_WORKET = "backtester-worker",
    TRADER_RUNNER = "trader-runner",
    TRADER_WORKER = "trader-worker"
  }

  const enum Event {
    IMPORTER_STARTED = "importer.started",
    IMPORTER_FINISHED = "importer.finished",
    IMPORTER_FAILED = "importer.failed",
    CANDLE_NEW = "candle.new",
    TICK_NEW = "tick.new"
  }

  const enum Status {
    pending = "pending",
    queued = "queued",
    started = "started",
    stopped = "stopped",
    finished = "finished",
    failed = "failed"
  }

  const enum ExwatcherStatus {
    pending = "pending",
    importing = "importing",
    subscribed = "subscribed",
    unsubscribed = "unsubscribed",
    failed = "failed"
  }

  const enum RobotPositionDirection {
    buy = "buy",
    sell = "sell"
  }

  const enum RobotPositionStatus {
    new = "new",
    open = "open",
    closed = "closed"
  }

  const enum RobotTradeStatus {
    new = "new",
    open = "open",
    closed = "closed"
  }

  const enum TradeAction {
    long = "long",
    short = "short",
    closeLong = "closeLong",
    closeShort = "closeShort"
  }

  const enum OrderType {
    stop = "stop",
    limit = "limit",
    market = "market"
  }

  const enum CandleType {
    loaded = "loaded",
    created = "created",
    previous = "previous"
  }

  const enum TimeUnit {
    minute = "minute",
    hour = "hour",
    day = "day"
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

  const enum Queue {
    importCandles = "importCandles"
  }

  type ImportType = "recent" | "history";

  interface ExchangeCandle {
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    time: number;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    type: CandleType;
  }

  interface ExchangeCandlesInTimeframes {
    [key: number]: ExchangeCandle[];
  }

  interface DBCandle {
    exchange: string;
    asset: string;
    currency: string;
    id: string;
    time: number;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    type: CandleType;
  }

  interface Candle extends DBCandle {
    timeframe: number;
  }

  interface ExchangePrice {
    exchange: string;
    asset: string;
    currency: string;
    time: number;
    timestamp: string;
    price: number;
  }

  interface ExchangeTrade extends ExchangePrice {
    amount: number;
    side: string;
  }

  interface ExwatcherTrade extends ExchangeTrade {
    tradeId: string;
    type: "trade" | "tick";
  }

  interface ExchangeTimeframes {
    [key: string]: Timeframe;
  }

  interface TimeframeProps {
    str: string;
    value: Timeframe;
    lower: Timeframe;
    unit: TimeUnit;
    amountInUnit: number;
  }

  interface Timeframes {
    [key: number]: TimeframeProps;
  }

  interface Importer {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    type: cpz.ImportType;
    params: any;
    status: cpz.Status;
    started_at?: string;
    ended_at?: string;
    error?: any;
  }

  interface Exwatcher {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    status: cpz.ExwatcherStatus;
    node_id: string;
    importer_id: string;
    error?: any;
  }
}
