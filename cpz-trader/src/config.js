import { TRADER_SERVICE } from "cpz/config/services";
import {
  TASKS_TOPIC,
  CANDLES_TOPIC,
  TICKS_TOPIC,
  SIGNALS_TOPIC,
  TRADES_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC
} from "cpz/events/topics";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT
} from "cpz/events/types/base";
import {
  CANDLES_NEWCANDLE_EVENT,
  CANDLES_HANDLED_EVENT
} from "cpz/events/types/candles";
import {
  ERROR_TRADER_ERROR_EVENT,
  ERROR_TRADER_WARN_EVENT
} from "cpz/events/types/error";
import { LOG_TRADER_LOG_EVENT } from "cpz/events/types/log";
import {
  SIGNALS_NEWSIGNAL_EVENT,
  SIGNALS_HANDLED_EVENT
} from "cpz/events/types/signals";
import {
  TICKS_NEWTICK_EVENT,
  TICKS_HANDLED_EVENT
} from "cpz/events/types/ticks";
import {
  TRADES_ORDER_EVENT,
  TRADES_POSITION_EVENT
} from "cpz/events/types/trades";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_UPDATED_EVENT
} from "cpz/events/types/tasks/trader";
import schemas from "cpz/events/schemas";

export default {
  serviceName: TRADER_SERVICE,
  events: {
    topics: {
      TASKS_TOPIC,
      CANDLES_TOPIC,
      TICKS_TOPIC,
      SIGNALS_TOPIC,
      TRADES_TOPIC,
      LOG_TOPIC,
      ERROR_TOPIC
    },
    types: {
      BASE_EVENT,
      SUB_VALIDATION_EVENT,
      SUB_DELETED_EVENT,
      CANDLES_NEWCANDLE_EVENT,
      CANDLES_HANDLED_EVENT,
      ERROR_TRADER_ERROR_EVENT,
      ERROR_TRADER_WARN_EVENT,
      LOG_TRADER_LOG_EVENT,
      SIGNALS_NEWSIGNAL_EVENT,
      SIGNALS_HANDLED_EVENT,
      TICKS_NEWTICK_EVENT,
      TICKS_HANDLED_EVENT,
      TRADES_ORDER_EVENT,
      TRADES_POSITION_EVENT,
      TASKS_TRADER_START_EVENT,
      TASKS_TRADER_STARTED_EVENT,
      TASKS_TRADER_STOP_EVENT,
      TASKS_TRADER_STOPPED_EVENT,
      TASKS_TRADER_UPDATE_EVENT,
      TASKS_TRADER_UPDATED_EVENT
    },
    schemas: {
      [BASE_EVENT]: schemas[BASE_EVENT],
      [CANDLES_NEWCANDLE_EVENT]: schemas[CANDLES_NEWCANDLE_EVENT],
      [CANDLES_HANDLED_EVENT]: schemas[CANDLES_HANDLED_EVENT],
      [ERROR_TRADER_ERROR_EVENT]: schemas[ERROR_TRADER_ERROR_EVENT],
      [ERROR_TRADER_WARN_EVENT]: schemas[ERROR_TRADER_WARN_EVENT],
      [LOG_TRADER_LOG_EVENT]: schemas[LOG_TRADER_LOG_EVENT],
      [SIGNALS_NEWSIGNAL_EVENT]: schemas[SIGNALS_NEWSIGNAL_EVENT],
      [SIGNALS_HANDLED_EVENT]: schemas[SIGNALS_HANDLED_EVENT],
      [TICKS_NEWTICK_EVENT]: schemas[TICKS_NEWTICK_EVENT],
      [TICKS_HANDLED_EVENT]: schemas[TICKS_HANDLED_EVENT],
      [TRADES_ORDER_EVENT]: schemas[TRADES_ORDER_EVENT],
      [TRADES_POSITION_EVENT]: schemas[TRADES_POSITION_EVENT],
      [TASKS_TRADER_START_EVENT]: schemas[TASKS_TRADER_START_EVENT],
      [TASKS_TRADER_STARTED_EVENT]: schemas[TASKS_TRADER_STARTED_EVENT],
      [TASKS_TRADER_STOP_EVENT]: schemas[TASKS_TRADER_STOP_EVENT],
      [TASKS_TRADER_STOPPED_EVENT]: schemas[TASKS_TRADER_STOPPED_EVENT],
      [TASKS_TRADER_UPDATE_EVENT]: schemas[TASKS_TRADER_UPDATE_EVENT],
      [TASKS_TRADER_UPDATED_EVENT]: schemas[TASKS_TRADER_UPDATED_EVENT]
    }
  }
};
