import {
  STORAGE_TASKS_EVENTS_TABLE,
  STORAGE_SIGNALS_EVENTS_TABLE,
  STORAGE_ORDERS_EVENTS_TABLE,
  STORAGE_POSITIONS_EVENTS_TABLE,
  STORAGE_LOGS_EVENTS_TABLE,
  STORAGE_ERRORS_EVENTS_TABLE
} from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_TASKS_EVENTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_SIGNALS_EVENTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_ORDERS_EVENTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_POSITIONS_EVENTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_LOGS_EVENTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_ERRORS_EVENTS_TABLE);

/**
 * Save tasks event
 *
 * @param {TasksEventData} data
 */
const saveTasksEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_TASKS_EVENTS_TABLE, data);

/**
 * Save signals event
 *
 * @param {SignalsEventData} data
 */
const saveSignalsEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_SIGNALS_EVENTS_TABLE, data);

/**
 * Save orders event
 *
 * @param {OrdersEventData} data
 */
const saveOrdersEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_ORDERS_EVENTS_TABLE, data);

/**
 * Save positions event
 *
 * @param {PositionsEventData} data
 */
const savePositionsEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_POSITIONS_EVENTS_TABLE, data);

/**
 * Save logs event
 *
 * @param {LogsEventData} data
 */
const saveLogsEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_LOGS_EVENTS_TABLE, data);

/**
 * Save erros event
 *
 * @param {ErrorsEventData} data
 */
const saveErrorsEvent = data =>
  tableStorage.insertOrMergeEntity(STORAGE_ERRORS_EVENTS_TABLE, data);

export {
  saveTasksEvent,
  saveSignalsEvent,
  saveOrdersEvent,
  savePositionsEvent,
  saveLogsEvent,
  saveErrorsEvent
};
