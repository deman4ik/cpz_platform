import { ValidationSchema } from "fastest-validator";

export interface GenericObject<T> {
  [key: string]: T;
}

declare namespace cpz {
  const enum Service {
    DB_IMPORTERS = "db-importers",
    DB_CANDLES = "db-candles",
    DB_CANDLES_CURRENT = "db-candles-current",
    DB_EXWATCHERS = "db-exwatchers",
    DB_BACKTESTS = "db-backtests",
    DB_BACKTEST_POSITIONS = "db-backtest-positions",
    DB_BACKTEST_SIGNALS = "db-backtest-signals",
    DB_BACKTEST_LOGS = "db-backtest-logs",
    DB_STRATEGIES = "db-strategies",
    DB_INDICATORS = "db-indicators",
    DB_ROBOTS = "db-robots",
    DB_ROBOT_JOBS = "db-robot-jobs",
    DB_ROBOT_POSITIONS = "db-robot-positions",
    DB_ROBOT_SIGNALS = "db-robot-signals",
    DB_ROBOT_LOGS = "db-robot-logs",
    DB_ROBOT_HISTORY = "db-robot-history",
    DB_USERS = "db-users",
    DB_USER_SIGNALS = "db-user-signals",
    DB_USER_EXCHANGE_ACCS = "db-user-exchange-accs",
    DB_USER_ROBOTS = "db-user-robots",
    DB_USER_ROBOT_JOBS = "db-user-robot-jobs",
    DB_USER_ROBOT_HISTORY = "db-user-robot-history",
    DB_USER_ORDERS = "db-user-orders",
    DB_USER_POSITIONS = "db-user-positions",
    DB_CONNECTOR_JOBS = "db-connector-jobs",
    EXWATCHER = "exwatcher",
    IMPORTER_RUNNER = "importer-runner",
    IMPORTER_WORKER = "importer-worker",
    PUBLIC_CONNECTOR = "public-connector",
    PRIVATE_CONNECTOR_RUNNER = "private-connector-runner",
    PRIVATE_CONNECTOR_WORKER = "private-connector-worker",
    ROBOT_RUNNER = "robot-runner",
    ROBOT_WORKER = "robot-worker",
    BACKTESTER_RUNNER = "backtester-runner",
    BACKTESTER_WORKER = "backtester-worker",
    USER_ROBOT_RUNNER = "user-robot-runner",
    USER_ROBOT_WORKER = "user-robot-worker",
    AUTH = "auth",
    API = "api"
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
    BACKTESTER_FINISHED_HISTORY = "backtester.finished.history",
    BACKTESTER_FAILED = "backtester.failed",
    BACKTESTER_FAILED_HISTORY = "backtester.failed.history",
    ROBOT_STARTED = "robot.started",
    ROBOT_STARTING = "robot.starting",
    ROBOT_STOPPED = "robot.stopped",
    ROBOT_UPDATED = "robot.updated",
    ROBOT_PAUSED = "robot.paused",
    ROBOT_RESUMED = "robot.resumed",
    ROBOT_FAILED = "robot.failed",
    ROBOT_LOG = "robot.log",
    ROBOT_WORKER_RELOAD_CODE = "robot-worker.reload-code",
    USER_ROBOT_STARTED = "user-robot.started",
    USER_ROBOT_STOPPED = "user-robot.stopped",
    USER_ROBOT_UPDATED = "user-robot.updated",
    USER_ROBOT_PAUSED = "user-robot.paused",
    USER_ROBOT_RESUMED = "user-robot.resumed",
    USER_ROBOT_FAILED = "user-robot.failed",
    CANDLE_NEW = "candle.new",
    TICK_NEW = "tick.new",
    SIGNAL_ALERT = "signal.alert",
    SIGNAL_TRADE = "signal.trade",
    ORDER_STATUS = "order.status",
    ORDER_ERROR = "order.error"
  }

  const enum Status {
    pending = "pending",
    queued = "queued",
    starting = "starting",
    stopping = "stopping",
    started = "started",
    stopped = "stopped",
    stopRequested = "stopRequested",
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

  const enum UserStatus {
    blocked = -1,
    new = 0,
    enabled = 1
  }

  const enum UserRoles {
    admin = "admin",
    moderator = "moderator",
    user = "user",
    anonymous = "anonymous"
  }

  const enum RobotJobType {
    start = "start",
    stop = "stop",
    pause = "pause",
    candle = "candle",
    tick = "tick"
  }

  const enum PositionDirection {
    long = "long",
    short = "short"
  }

  const enum OrderDirection {
    buy = "buy",
    sell = "sell"
  }

  const enum RobotPositionStatus {
    new = "new",
    open = "open",
    closed = "closed"
  }

  const enum UserPositionStatus {
    delayed = "delayed",
    new = "new",
    open = "open",
    canceled = "canceled",
    closed = "closed",
    closedAuto = "closedAuto"
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
    market = "market",
    forceMarket = "forceMarket"
  }

  const enum OrderStatus {
    new = "new",
    open = "open",
    closed = "closed",
    canceled = "canceled"
  }

  const enum OrderJobType {
    create = "create",
    recreate = "recreate",
    cancel = "cancel",
    check = "check"
  }

  const enum UserPositionOrderStatus {
    new = "new",
    open = "open",
    partial = "partial",
    closed = "closed",
    canceled = "canceled"
  }

  const enum UserPositionJob {
    open = "open",
    cancel = "cancel",
    close = "close",
    forceClose = "forceClose"
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
    second = "second",
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
    "8h" = 480,
    "12h" = 720,
    "1d" = 1440
  }

  const enum Queue {
    importCandles = "importCandles",
    runRobot = "runRobot",
    backtest = "backtest",
    connector = "connector",
    runUserRobot = "runUserRobot"
  }

  const enum UserExchangeAccStatus {
    enabled = "enabled",
    disabled = "disabled",
    invalid = "invalid"
  }

  const enum UserRobotJobType {
    stop = "stop",
    pause = "pause",
    signal = "signal",
    order = "order"
  }

  const enum ConnectorJobType {
    order = "order"
  }

  type ImportType = "recent" | "history";

  interface ConnectorJob {
    id: string;
    userExAccId: string;
    type: ConnectorJobType;
    data?: any;
  }
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

  interface Events<T> {
    type: cpz.Event;
    data: T;
  }

  interface RobotEventData extends GenericObject<any> {
    robotId: string;
  }

  interface UserRobotEventData extends GenericObject<any> {
    userRobotId: string;
  }

  interface TradeInfo {
    action: TradeAction;
    orderType: OrderType;
    price?: number;
  }

  interface AlertInfo extends TradeInfo {
    candleTimestamp: string;
  }

  interface SignalInfo extends AlertInfo {
    type: SignalType;
    positionId: string;
    positionPrefix: string;
    positionCode: string;
    positionParentId?: string;
  }

  interface SignalEvent extends SignalInfo {
    id: string;
    robotId: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    timestamp: string;
  }

  interface OrderJob {
    type: OrderJobType;
    data?: any;
  }

  interface OrderWithJob {
    id: string;
    nextJobAt: string;
    nextJob: OrderJob;
  }
  interface Order {
    id: string;
    userExAccId: string;
    userRobotId: string;
    positionId: string;
    userPositionId: string;
    exchange: string;
    asset: string;
    currency: string;
    action: cpz.TradeAction;
    direction: cpz.OrderDirection;
    type: cpz.OrderType;
    signalPrice?: number;
    price?: number;
    volume: number;
    params: GenericObject<any>;
    createdAt: string;
    status: OrderStatus;
    exId?: string;
    exTimestamp?: string;
    exLastTradeAt?: string;
    remaining?: number;
    executed?: number;
    lastCheckedAt?: string;
    error?: any;
    nextJobAt?: string;
    nextJob?: OrderJob;
  }
  interface Importer {
    id: string;
    exchange: string;
    asset: string;
    currency: string;
    type: cpz.ImportType;
    params: any;
    status: cpz.Status;
    progress?: number;
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

  interface CodeFilesInDB {
    id: string;
    name: string;
    author?: string;
    available: number;
    file: string;
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
    _eventsToSend: cpz.Events<any>[];
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
    _eventsToSend: cpz.Events<any>[];
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
    timeframe: number;
    volume: number;
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
    barsHeld?: number;
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
    volume?: number;
    requiredHistoryMaxBars?: number;
  }

  interface RobotTradeSettings {
    slippage?: {
      entry?: {
        stepPercent: number;
        count?: number;
      };
      exit?: {
        stepPercent: number;
        count?: number;
      };
    };
    deviation?: {
      entry?: number;
      exit?: number;
    };
    orderTimeout?: number;
    multiPosition?: boolean;
  }
  interface RobotStatVals<T> {
    all?: T;
    long?: T;
    short?: T;
  }

  interface RobotStats {
    tradesCount?: RobotStatVals<number>;
    tradesWinning?: RobotStatVals<number>;
    tradesLosing?: RobotStatVals<number>;
    winRate?: RobotStatVals<number>;
    lossRate?: RobotStatVals<number>;
    avgBarsHeld?: RobotStatVals<number>;
    avgBarsHeldWinning?: RobotStatVals<number>;
    avgBarsHeldLosing?: RobotStatVals<number>;
    netProfit?: RobotStatVals<number>;
    avgNetProfit?: RobotStatVals<number>;
    grossProfit?: RobotStatVals<number>;
    avgProfit?: RobotStatVals<number>;
    grossLoss?: RobotStatVals<number>;
    avgLoss?: RobotStatVals<number>;
    maxConnsecWins?: RobotStatVals<number>;
    maxConsecLosses?: RobotStatVals<number>;
    maxDrawdown?: RobotStatVals<number>;
    maxDrawdownDate?: RobotStatVals<string>;
    profitFactor?: RobotStatVals<number>;
    recoveryFactor?: RobotStatVals<number>;
    payoffRatio?: RobotStatVals<number>;
  }

  interface RobotEquity {
    profit?: number;
    lastProfit?: number;
    changes?: { x: number; y: number }[];
  }

  interface RobotHead {
    id: string;
    code: string;
    mod: string;
    name: string;
  }

  interface RobotState extends RobotHead {
    exchange: string;
    asset: string;
    currency: string;
    timeframe: Timeframe;
    available?: number;
    strategyName: string;
    settings: RobotSettings;
    tradeSettings?: RobotTradeSettings;
    lastCandle?: Candle;
    state?: StrategyProps;
    hasAlerts?: boolean;
    indicators?: { [key: string]: IndicatorState };
    status?: Status;
    startedAt?: string;
    stoppedAt?: string;
    statistics?: RobotStats;
    equity?: RobotEquity;
  }

  interface RobotJob {
    id: string;
    robotId: string;
    type: RobotJobType;
    data?: Candle | ExwatcherTrade;
  }

  interface BacktesterSettings {
    local?: boolean;
    populateHistory?: boolean;
  }

  interface BacktesterState {
    id: string;
    robotId: string;
    exchange?: string;
    asset?: string;
    currency?: string;
    timeframe?: Timeframe;
    strategyName?: string;
    dateFrom: string;
    dateTo: string;
    settings?: BacktesterSettings;
    robotSettings?: RobotSettings;
    totalBars?: number;
    processedBars?: number;
    leftBars?: number;
    completedPercent?: number;
    status: string;
    startedAt?: string;
    finishedAt?: string;
    statistics?: RobotStats;
    equity?: RobotEquity;
    robotState?: StrategyProps;
    robotIndicators?: { [key: string]: IndicatorState };
    error?: any;
  }

  interface BacktesterPositionState extends RobotPositionState {
    backtestId: string;
  }

  interface BacktesterSignals extends SignalEvent {
    backtestId: string;
  }

  interface UserRolesList {
    allowedRoles: string[];
    defaultRole: string;
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    telegramId?: number;
    telegramUsername?: string;
    status: UserStatus;
    passwordHash?: string;
    registrationCode?: string;
    refreshToken?: string;
    roles: UserRolesList;
    settings: GenericObject<any>;
  }

  interface UserSignals {
    id: string;
    robotId: string;
    userId: string;
    telegram: boolean;
    email: boolean;
    subscribedAt: string;
    volume?: number;
  }

  interface EncryptedData {
    data: string;
    iv: string;
  }

  interface UserExchangeKeys {
    key: EncryptedData;
    secret: EncryptedData;
    pass?: EncryptedData;
  }

  interface UserExchangeAccount {
    id: string;
    userId: string;
    exchange: string;
    name?: string;
    keys: UserExchangeKeys;
    status: UserExchangeAccStatus;
    ordersCache: GenericObject<any>;
  }

  interface UserRobotSettings {
    volume: number;
    kraken?: {
      leverage?: number;
    };
  }

  interface UserRobotInternalState {
    latestSignal?: SignalEvent;
    posLastNumb?: GenericObject<number>;
  }
  interface UserRobotDB {
    id: string;
    userExAccId: string;
    robotId: string;
    settings: UserRobotSettings;
    internalState: UserRobotInternalState;
    status: Status;
    startedAt?: string;
    stoppedAt?: string;
    statistics?: RobotStats;
    equity?: RobotEquity;
    error?: any;
  }

  interface UserRobotState extends UserRobotDB {
    robot: {
      exchange: string;
      asset: string;
      currency: string;
      timeframe: Timeframe;
      tradeSettings: RobotTradeSettings;
    };
    positions: UserPositionState[];
  }

  class UserRobot {
    constructor(state: UserRobotState);
    state: {
      userRobot: UserRobotDB;
      positions?: UserPositionDB[];
      ordersToCreate?: Order[];
      orderWithJobs?: OrderWithJob[];
      eventsToSend?: Events<UserRobotEventData>[];
    };
    _log(...args: any): void;
    handleSignal(signal: SignalEvent): void;
    handleOrder(order: Order): void;
  }
  interface UserRobotJob {
    id: string;
    userRobotId: string;
    type: UserRobotJobType;
    data?: SignalEvent | Order;
  }

  interface UserPositionInternalState {
    entrySlippageCount: number;
    exitSlippageCount: number;
  }
  interface UserPositionDB {
    id: string;
    prefix: string;
    code: string;
    positionId: string;
    userRobotId: string;
    status: UserPositionStatus;
    parentId?: string;
    direction: PositionDirection;
    entryStatus?: UserPositionOrderStatus;
    entrySignalPrice?: number;
    entryPrice?: number;
    entryDate?: string;
    entryVolume?: number;
    entryExecuted?: number;
    entryRemaining?: number;
    entryOrderIds?: string[];
    exitStatus?: UserPositionOrderStatus;
    exitSignalPrice?: number;
    exitPrice?: number;
    exitDate?: string;
    exitVolume?: number;
    exitExecuted?: number;
    exitRemaining?: number;
    exitOrderIds?: string[];
    internalState: UserPositionInternalState;
    reason?: string; //TODO ENUM
    profit?: number;
    barsHeld?: number;
    nextJobAt?: string;
    nextJob?: UserPositionJob;
  }

  interface UserPositionState extends UserPositionDB {
    robot: {
      exchange: string;
      asset: string;
      currency: string;
      timeframe: Timeframe;
      tradeSettings: RobotTradeSettings;
    };
    userRobot: {
      userExAccId: string;
      settings: UserRobotSettings;
    };
    entryOrders?: Order[];
    exitOrders?: Order[];
  }

  class UserPosition {
    constructor(state: cpz.UserPositionState);
    id: string;
    prefix: string;
    code: string;
    positionId: string;
    status: UserPositionStatus;
    parentId?: string;
    state: UserPositionDB;
    ordersToCreate: Order[];
    orderWithJobs: OrderWithJob[];
    _log(...args: any): void;
    handleSignal(signal: SignalEvent): void;
    handleOrder(order: Order): void;
  }
}
