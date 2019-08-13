import { ValidationSchema } from "fastest-validator";

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
    BACKTESTER_WORKER = "backtester-worker",
    TRADER_RUNNER = "trader-runner",
    TRADER_WORKER = "trader-worker"
  }

  const enum Event {
    LOG = "log",
    ERROR = "error",
    IMPORTER_STARTED = "importer.started",
    IMPORTER_STOPPED = "importer.stopped",
    IMPORTER_FINISHED = "importer.finished",
    IMPORTER_FAILED = "importer.failed",
    BACKTESTER_STARTED = "backtester.started",
    BACKTESTER_STOPPED = "backtester.stopped",
    BACKTESTER_FINISHED = "backtester.finished",
    BACKTESTER_FAILED = "backtester.failed",
    BACKTESTER_WORKER_START = "backtester-worker.start",
    ROBOT_STARTED = "robot.started",
    ROBOT_STOPPED = "robot.stopped",
    ROBOT_UPDATED = "robot.updated",
    ROBOT_PAUSED = "robot.paused",
    ROBOT_FAILED = "robot.failed",
    TRADER_STARTED = "trader.started",
    TRADER_STOPPED = "trader.stopped",
    TRADER_UPDATED = "trader.updated",
    TRADER_PAUSED = "trader.paused",
    TRADER_FAILED = "trader.failed",
    CANDLE_NEW = "candle.new",
    TICK_NEW = "tick.new",
    SIGNAL_ALERT = "signal.alert",
    SIGNAL_TRADE = "signal.trade"
  }

  const enum Status {
    pending = "pending",
    queued = "queued",
    started = "started",
    stopped = "stopped",
    paused = "paused",
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

  const enum PositionDirection {
    long = "long",
    short = "short"
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

  const enum IndicatorType {
    base = "base",
    tulip = "tulip"
    /*talib = "talib",
    techind = "techind"*/
  }

  const enum SignalType {
    alert = "alert",
    trade = "trade"
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

  interface CandleProps {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
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

  interface Events {
    type: cpz.Event;
    data: any;
  }

  interface AlertInfo {
    action: TradeAction;
    orderType: OrderType;
    price: number;
  }

  interface SignalInfo extends AlertInfo {
    type: SignalType;
    position: {
      id: string;
      prefix: string;
      code: string;
      parentId?: string;
    };
  }

  interface SignalEvent extends SignalInfo {
    signalId: string;
    robotId: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    candleId: string;
    candleTimestamp: string;
    timestamp: string;
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

  interface IndicatorState {
    [key: string]: any;
    name: string;
    indicatorName: string;
    initialized?: boolean;
    parameters?: { [key: string]: number };
    robotSettings?: { [key: string]: any };
    variables?: { [key: string]: any };
    indicatorFunctions?: { [key: string]: () => any };
    parametersSchema?: ValidationSchema;
    log?(...args: any): void;
  }

  interface IndicatorCode {
    [key: string]: any;
    init(): void;
    calc(): void;
  }

  class Indicator {
    constructor(state: cpz.IndicatorState);
    [key: string]: any;
    initialized: boolean;
    parameters?: { [key: string]: number };
    _eventsToSend: cpz.Events[];
    _checkParameters(): void;
    _handleCandles(
      candle: cpz.Candle,
      candles: cpz.Candle[],
      candlesProps: cpz.CandleProps
    ): void;
    init(): void;
    calc(): void;
  }

  interface StrategyProps {
    initialized: boolean;
    posLastNumb: { [key: string]: number };
    positions: cpz.RobotPositionState[];
    indicators: {
      [key: string]: IndicatorState;
    };
    variables: { [key: string]: any };
  }
  interface StrategyState extends StrategyProps {
    parameters?: { [key: string]: number | string };
    robotSettings: { [key: string]: any };
    exchange: string;
    asset: string;
    currency: string;
    timeframe: cpz.Timeframe;
    robotId: string;
    parametersSchema: ValidationSchema;
    strategyFunctions: { [key: string]: () => any };
    log?(...args: any): void;
  }

  interface StrategyCode {
    [key: string]: any;
    init(): void;
    check(): void;
  }

  class Strategy {
    constructor(state: cpz.StrategyState);
    [key: string]: any;
    initialized: boolean;
    posLastNumb: { [key: string]: number };
    hasAlerts: boolean;
    hasActivePositions: boolean;
    indicators: {
      [key: string]: cpz.IndicatorState;
    };
    validPositions: RobotPositionState[];
    _eventsToSend: cpz.Events[];
    _positionsToSave: cpz.RobotPositionState[];
    init(): void;
    check(): void;
    log(...args: any): void;
    logEvent(...args: any): void;
    _checkParameters(): void;
    _handleCandles(
      candle: cpz.Candle,
      candles: cpz.Candle[],
      candlesProps: cpz.CandleProps
    ): void;
    _handleIndicators(indicators: { [key: string]: cpz.IndicatorState }): void;
    _clearAlerts(): void;
    _checkAlerts(): void;
  }

  interface RobotPositionState {
    id: string;
    robot_id: string;
    prefix: string;
    code: string;
    parent_id?: string;
    direction?: PositionDirection;
    status?: RobotPositionStatus;
    entry_status?: RobotTradeStatus;
    entry_price?: number;
    entry_date?: string;
    entry_order_type?: OrderType;
    entry_action?: TradeAction;
    exit_status?: RobotTradeStatus;
    exit_price?: number;
    exit_date?: string;
    exit_order_type?: OrderType;
    exit_action?: TradeAction;
    alerts?: { [key: string]: cpz.AlertInfo };
    profit?: number;
    log?(...args: any): void;
  }

  class RobotPosition {
    constructor(state: cpz.RobotPositionState);
    id: string;
    prefix: string;
    code: string;
    parentId: string;
    direction: PositionDirection;
    entryStatus: RobotTradeStatus;
    exitStatus: RobotTradeStatus;
    status: RobotPositionStatus;
    isActive: boolean;
    hasAlerts: boolean;
    hasAlertsToPublish: boolean;
    hasTradeToPublish: boolean;
    state: RobotPositionState;
    alertsToPublish: SignalInfo[];
    tradeToPublish: SignalInfo;
    _clearAlertsToPublish(): void;
    _clearTradeToPublish(): void;
    _clearAlerts(): void;
    _handleCandle(candle: Candle): void;
    _checkAlerts(): void;
  }

  interface RobotSettings {
    strategyParameters?: { [key: string]: any };
    requiredHistoryMaxBars?: number;
  }
  interface RobotState {
    robot_id: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    strategy_name: string;
    settings: RobotSettings;
    last_candle?: Candle;
    strategy?: StrategyProps;
    has_alerts?: boolean;
    indicators?: { [key: string]: IndicatorState };
    status?: Status;
    started_at?: string;
    stopped_at?: string;
    log?(...args: any): void;
  }

  interface BacktesterState {
    id: string;
    robot_id: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    strategy_name: string;
    dateFrom: string;
    dateTo: string;
    settings: { [key: string]: any };
    robot_settings: RobotSettings;
    total_bars?: number;
    processed_bars?: number;
    left_bars?: number;
    completed_percent?: number;
    status: string;
    started_at: string;
    finsihed_at: string;
    error?: any;
  }
}
