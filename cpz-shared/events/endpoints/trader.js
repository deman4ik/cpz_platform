import { TRADER_SERVICE } from "../../config/services";
import {
  TASKS_TOPIC,
  CANDLES_TOPIC,
  SIGNALS_TOPIC,
  TICKS_TOPIC
} from "../topics";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT
} from "../types/tasks/trader";
import { CANDLES_NEWCANDLE_EVENT } from "../types/candles";
import { TICKS_NEWTICK_EVENT } from "../types/ticks";
import { SIGNALS_NEWSIGNAL_EVENT } from "../types/signals";

export default {
  [TRADER_SERVICE]: [
    {
      name: `${TRADER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8106,
      types: [
        TASKS_TRADER_START_EVENT,
        TASKS_TRADER_STOP_EVENT,
        TASKS_TRADER_UPDATE_EVENT
      ]
    },
    {
      name: `${TRADER_SERVICE}-${CANDLES_TOPIC}`,
      topic: CANDLES_TOPIC,
      url: "/api/candleEvents",
      localPort: 8106,
      types: [CANDLES_NEWCANDLE_EVENT]
    },
    {
      name: `${TRADER_SERVICE}-${TICKS_TOPIC}`,
      topic: TICKS_TOPIC,
      url: "/api/tickEvents",
      localPort: 8106,
      types: [TICKS_NEWTICK_EVENT]
    },
    {
      name: `${TRADER_SERVICE}-${SIGNALS_TOPIC}`,
      topic: SIGNALS_TOPIC,
      url: "/api/signalEvents",
      localPort: 8106,
      types: [SIGNALS_NEWSIGNAL_EVENT]
    }
  ]
};