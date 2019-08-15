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
    DB_BACKTESTS = "db-backtests",
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
    id?: string;
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
    candleTimestamp: string;
    signalTimestamp: string;
  }

  interface Importer {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    type: cpz.ImportType;
    params: any;
    status: cpz.Status;
    startedAt?: string;
    endedAt?: string;
    error?: any;
  }

  interface Exwatcher {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    status: cpz.ExwatcherStatus;
    nodeID: string;
    importerId: string;
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
    _log(...args: any): void;
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
    robotId: string;
    prefix: string;
    code: string;
    parentId?: string;
    direction?: PositionDirection;
    status?: RobotPositionStatus;
    entryStatus?: RobotTradeStatus;
    entryPrice?: number;
    entryDate?: string;
    entryOrderType?: OrderType;
    entryAction?: TradeAction;
    entryCandleTimestamp?: string;
    exitStatus?: RobotTradeStatus;
    exitPrice?: number;
    exitDate?: string;
    exitOrderType?: OrderType;
    exitAction?: TradeAction;
    exitCandleTimestamp?: string;
    alerts?: { [key: string]: cpz.AlertInfo };
    profit?: number;
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
    _log(...args: any): void;
  }

  interface RobotSettings {
    strategyParameters?: { [key: string]: any };
    requiredHistoryMaxBars?: number;
  }
  interface RobotState {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    strategyName: string;
    settings: RobotSettings;
    lastCandle?: Candle;
    strategy?: StrategyProps;
    hasAlerts?: boolean;
    indicators?: { [key: string]: IndicatorState };
    status?: Status;
    startedAt?: string;
    stoppedAt?: string;
  }

  interface BacktesterState {
    id: string;
    robotId?: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    strategyName: string;
    dateFrom: string;
    dateTo: string;
    settings: { [key: string]: any };
    robotSettings: RobotSettings;
    totalBars?: number;
    processedBars?: number;
    leftBars?: number;
    completedPercent?: number;
    status: string;
    startedAt?: string;
    finishedAt?: string;
    error?: any;
  }

  interface BacktesterPositionState extends RobotPositionState {
    backtestId: string;
  }

  interface BacktesterSignals extends SignalEvent {
    backtestId: string;
  }
}
