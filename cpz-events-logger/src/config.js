import { EVENTS_LOGGER_SERVICE } from "cpz/config/services";
import { TASKS_TOPIC } from "cpz/events/topics";
import { BASE_EVENT } from "cpz/events/types";
import schemas from "cpz/events/schemas";
import {
  CANDLES_NEWCANDLE_EVENT,
  SIGNALS_NEWSIGNAL_EVENT,
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_USERROBOT_STARTED_EVENT,
  TASKS_USERROBOT_STOPPED_EVENT,
  TRADES_ORDER_EVENT,
  TRADES_POSITION_EVENT
} from "cpz/config/events/types";

export default {
  serviceName: EVENTS_LOGGER_SERVICE,
  events: {
    topics: {
      TASKS_TOPIC
    },
    types: {
      BASE_EVENT,
      SUB_VALIDATION_EVENT,
      SUB_DELETED_EVENT,
      CANDLES_NEWCANDLE_EVENT,
      SIGNALS_NEWSIGNAL_EVENT,
      TRADES_ORDER_EVENT,
      TRADES_POSITION_EVENT,
      TASKS_USERROBOT_STARTED_EVENT,
      TASKS_USERROBOT_STOPPED_EVENT
    },
    schemas: {
      [BASE_EVENT]: schemas[BASE_EVENT],
      [CANDLES_NEWCANDLE_EVENT]: schemas[CANDLES_NEWCANDLE_EVENT],
      [SIGNALS_NEWSIGNAL_EVENT]: schemas[SIGNALS_NEWSIGNAL_EVENT],
      [TRADES_ORDER_EVENT]: schemas[TRADES_ORDER_EVENT],
      [TRADES_POSITION_EVENT]: schemas[TRADES_POSITION_EVENT],
      [TASKS_USERROBOT_STARTED_EVENT]: schemas[TASKS_USERROBOT_STARTED_EVENT],
      [TASKS_USERROBOT_STOPPED_EVENT]: schemas[TASKS_USERROBOT_STOPPED_EVENT]
    }
  }
};