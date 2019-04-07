import client from "./index";

const TABLES = {
  STORAGE_TASKS_EVENTS_TABLE: "TasksEvents",
  STORAGE_SIGNALS_EVENTS_TABLE: "SignalsEvents",
  STORAGE_ORDERS_EVENTS_TABLE: "OrdersEvents",
  STORAGE_POSITIONS_EVENTS_TABLE: "PositionsEvents",
  STORAGE_LOGS_EVENTS_TABLE: "LogEvents",
  STORAGE_ERRORS_EVENTS_TABLE: "ErrorEvents",
  STORAGE_TRADER_FAILED_EVENTS_TABLE: "TraderFailedEvents"
};

/**
 * Save tasks event
 *
 * @param {Object} data
 */
const saveTasksEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_TASKS_EVENTS_TABLE, data);

/**
 * Save signals event
 *
 * @param {Object} data
 */
const saveSignalsEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_SIGNALS_EVENTS_TABLE, data);

/**
 * Save orders event
 *
 * @param {Object} data
 */
const saveOrdersEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_ORDERS_EVENTS_TABLE, data);

/**
 * Save positions event
 *
 * @param {Object} data
 */
const savePositionsEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_POSITIONS_EVENTS_TABLE, data);

/**
 * Save logs event
 *
 * @param {Object} data
 */
const saveLogsEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_LOGS_EVENTS_TABLE, data);

/**
 * Save erros event
 *
 * @param {Object} data
 */
const saveErrorsEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_ERRORS_EVENTS_TABLE, data);

/**
 * Save trader failed event
 *
 * @param {Object} data
 */
const saveTraderFailedEvent = data =>
  client.insertOrMergeEntity(TABLES.STORAGE_TRADER_FAILED_EVENTS_TABLE, data);

export {
  saveTasksEvent,
  saveSignalsEvent,
  saveOrdersEvent,
  savePositionsEvent,
  saveLogsEvent,
  saveErrorsEvent,
  saveTraderFailedEvent
};
export default Object.values(TABLES);