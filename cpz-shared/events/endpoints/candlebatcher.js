import { CANDLEBATCHER_SERVICE } from "../../config/services";
import { TASKS_TOPIC } from "../topics";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT
} from "../types/tasks/candlebatcher";

export default {
  [CANDLEBATCHER_SERVICE]: [
    {
      name: `${CANDLEBATCHER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8103,
      types: [
        TASKS_CANDLEBATCHER_START_EVENT,
        TASKS_CANDLEBATCHER_STOP_EVENT,
        TASKS_CANDLEBATCHER_UPDATE_EVENT
      ]
    }
  ]
};
