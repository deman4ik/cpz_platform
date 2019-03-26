import { TRADER_SERVICE } from "cpz/config/services";

const SERVICE_NAME = TRADER_SERVICE;

const FUNCTIONS = {
  HTTP_TASK_EVENTS: "funcTaskEvents",
  HTTP_SIGNAL_EVENTS: "funcSignalEvents",
  HTTP_CANDLE_EVENTS: "funcCandleEvents",
  HTTP_TICK_EVENTS: "funcTickEvents",
  TIMER: "funcTimer",
  ORCHESTRATOR: "funcOrchestrator",
  ACTIVITY_CHECK_PRICE: "funcCheckPrice",
  ACTIVITY_CLOSE_ACTIVE_POSITIONS: "funcCloseActivePositions",
  ACTIVITY_DELETE_ACTION: "funcDeleteAction",
  ACTIVITY_EVENT_PUBLISH: "funcEventPublish",
  ACTIVITY_EXECUTE_ORDERS: "funcExecuteOrders",
  ACTIVITY_GET_CURRENT_RPICE: "funcGetCurrentPrice",
  ACTIVITY_HANDLE_ORDERS: "funcHandleOrders",
  ACTIVITY_HANDLE_SIGNAL: "funcHandleSignal",
  ACTIVITY_LOAD_ACTION: "funcLoadAction",
  ACTIVITY_SAVE_STATE: "funcSaveState",
  ACTIVITY_START_TRADER: "funcStartTrader",
  ACTIVITY_STOP_TRADER: "funcStopTrader",
  ACTIVITY_UPDATE_TRADER: "funcUpdateTrader"
};
const INTERNAL = {
  actions: {
    START: "start",
    STOP: "stop",
    UPDATE: "update",
    SIGNAL: "signal",
    PRICE: "price",
    CHECK: "check"
  },
  status: {
    READY: "ready",
    BUSY: "busy"
  },
  events: {
    TRADER_ACTION: "traderAction"
  },
  traderIdleMinutes: 1
};
export { SERVICE_NAME, FUNCTIONS, INTERNAL };
