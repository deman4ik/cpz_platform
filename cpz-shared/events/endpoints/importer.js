import { IMPORTER_SERVICE } from "../../config/services";
import { TASKS_TOPIC } from "../topics";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT
} from "../types/tasks/importer";

export default {
  [IMPORTER_SERVICE]: [
    {
      name: `${IMPORTER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      localPort: 8105,
      types: [TASKS_IMPORTER_START_EVENT, TASKS_IMPORTER_STOP_EVENT]
    }
  ]
};
