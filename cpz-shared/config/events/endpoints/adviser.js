import { ADVISER_SERVICE } from "../../services";
import { TASKS_TOPIC, CANDLES_TOPIC } from "./topics";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT
} from "../types/tasks/adviser";
import { CANDLES_NEWCANDLE_EVENT } from "../types/candles/candles";

export default {
  [ADVISER_SERVICE]: [
    {
      name: `${ADVISER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      types: [
        TASKS_ADVISER_START_EVENT.eventType,
        TASKS_ADVISER_STOP_EVENT.eventType,
        TASKS_ADVISER_UPDATE_EVENT.eventType
      ]
    },
    {
      name: `${ADVISER_SERVICE}-${CANDLES_TOPIC}`,
      topic: CANDLES_TOPIC,
      url: "/api/candleEvents",
      types: [CANDLES_NEWCANDLE_EVENT.eventType]
    }
  ]
};
