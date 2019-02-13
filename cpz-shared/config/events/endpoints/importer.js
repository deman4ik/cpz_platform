import { IMPORTER_SERVICE } from "../../services";
import { TASKS_TOPIC } from "./topics";
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
      types: [
        TASKS_IMPORTER_START_EVENT.eventType,
        TASKS_IMPORTER_STOP_EVENT.eventType
      ]
    }
  ]
};
