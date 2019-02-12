import { MARKETWATCHER_SERVICE } from "../../services";
import { TASKS_TOPIC } from "./topics";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "../types/tasks/marketwatcher";

export default {
  endpoints: [
    {
      name: `${MARKETWATCHER_SERVICE}-${TASKS_TOPIC}`,
      topic: TASKS_TOPIC,
      url: "/api/taskEvents",
      types: [
        TASKS_MARKETWATCHER_START_EVENT.eventType,
        TASKS_MARKETWATCHER_STOP_EVENT.eventType,
        TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.eventType,
        TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.eventType
      ]
    }
  ]
};
