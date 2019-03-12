import { BACKTESTER_SERVICE } from "../../config/services";
import { TASKS_TOPIC } from "../topics";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "../types/tasks/backtester";

export default {
  [BACKTESTER_SERVICE]: [
    {
      name: `${BACKTESTER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8108,
      types: [TASKS_BACKTESTER_START_EVENT, TASKS_BACKTESTER_STOP_EVENT]
    }
  ]
};
