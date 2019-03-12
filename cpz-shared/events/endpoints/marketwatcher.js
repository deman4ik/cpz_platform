import { MARKETWATCHER_SERVICE } from "../../config/services";
import { TASKS_TOPIC } from "../topics";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "../types/tasks/marketwatcher";

export default {
  [MARKETWATCHER_SERVICE]: [
    {
      name: `${MARKETWATCHER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8102,
      types: [
        TASKS_MARKETWATCHER_START_EVENT,
        TASKS_MARKETWATCHER_STOP_EVENT,
        TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
        TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
      ]
    }
  ]
};
