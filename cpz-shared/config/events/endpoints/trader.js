import { TRADER_SERVICE } from "../../services";
import {
  TASKS_TOPIC,
  CANDLES_TOPIC,
  SIGNALS_TOPIC,
  TICKS_TOPIC
} from "./topics";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT
} from "../types/tasks/trader";
import { CANDLES_NEWCANDLE_EVENT } from "../types/candles/candles";
import { TICKS_NEWTICK_EVENT } from "../types/ticks/ticks";
import { SIGNALS_NEWSIGNAL_EVENT } from "../types/signals/signals";

export default {
  endpoints: [
    {
      name: `${TRADER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      types: [
        TASKS_TRADER_START_EVENT.eventType,
        TASKS_TRADER_STOP_EVENT.eventType,
        TASKS_TRADER_UPDATE_EVENT.eventType
      ]
    },
    {
      name: `${TRADER_SERVICE}-${CANDLES_TOPIC}`,
      topic: CANDLES_TOPIC,
      url: "/api/candleEvents",
      types: [CANDLES_NEWCANDLE_EVENT.eventType]
    },
    {
      name: `${TRADER_SERVICE}-${TICKS_TOPIC}`,
      topic: TICKS_TOPIC,
      url: "/api/candleEvents",
      types: [TICKS_NEWTICK_EVENT.eventType]
    },
    {
      name: `${TRADER_SERVICE}-${SIGNALS_TOPIC}`,
      topic: SIGNALS_TOPIC,
      url: "/api/candleEvents",
      types: [SIGNALS_NEWSIGNAL_EVENT.eventType]
    }
  ]
};