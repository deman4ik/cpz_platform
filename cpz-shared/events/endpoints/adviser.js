import { ADVISER_SERVICE } from "../../config/services";
import { TASKS_TOPIC, CANDLES_TOPIC } from "../topics";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_RUN_EVENT,
  TASKS_ADVISER_PAUSE_EVENT,
  TASKS_ADVISER_RESUME_EVENT
} from "../types/tasks/adviser";
import { CANDLES_NEWCANDLE_EVENT } from "../types/candles";

export default {
  [ADVISER_SERVICE]: [
    {
      name: `${ADVISER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8104,
      types: [
        TASKS_ADVISER_START_EVENT,
        TASKS_ADVISER_STOP_EVENT,
        TASKS_ADVISER_UPDATE_EVENT,
        TASKS_ADVISER_RUN_EVENT,
        TASKS_ADVISER_PAUSE_EVENT,
        TASKS_ADVISER_RESUME_EVENT
      ]
    },
    {
      name: `${ADVISER_SERVICE}-${CANDLES_TOPIC}`,
      topic: CANDLES_TOPIC,
      url: "/api/candleEvents",
      localPort: 8104,
      types: [CANDLES_NEWCANDLE_EVENT]
    }
  ]
};
