import { TRADER_SERVICE } from "cpz/config/services";

const SERVICE_NAME = TRADER_SERVICE;

const FUNCTIONS = {
  HTTP_TASK_EVENTS: "funcTaskEvents",
  HTTP_SIGNAL_EVENTS: "funcSignalEvents",
  HTTP_CANDLE_EVENTS: "funcCandleEvents",
  HTTP_TICK_EVENTS: "funcTickEvents",
  TIMER: "funcTimer",
  ORCHESTRATOR: "funcOrchestrator",
  ACTIVITY_EVENT_PUBLISH: "funcEventPublish",
  ACTIVITY_EXECUTE_ORDERS: "funcExecuteOrders",
  ACTIVITY_LOAD_ACTION: "funcLoadAction",
  ACTIVITY_SAVE_STATE: "funcSaveState",
  ACTIVITY_EXECUTE_TRADER: "funcExecuteTrader"
};
const INTERNAL = {
  actions: {
    START: "start",
    STOP: "stop",
    REQUEST_STOP: "requestStop",
    UPDATE: "update",
    SIGNAL: "handleSignal",
    PRICE: "checkPrice",
    CHECK: "checkOrders",
    ORDERS: "handleOrders",
    ERROR: "setError"
  },
  status: {
    READY: "ready",
    BUSY: "busy",
    STOPPED: "stopped"
  },
  events: {
    TRADER_ACTION: "traderAction"
  },
  traderIdleMinutes: 1,
  checkActionSeconds: 10
};
export { SERVICE_NAME, FUNCTIONS, INTERNAL };
