import { BASE_ERROR } from "../base";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UPDATED_EVENT
} from "../../types/tasks/marketwatcher";

const TASKS_MARKETWATCHER_EVENTS = {
  [TASKS_MARKETWATCHER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange", empty: false },
    debug: {
      description: "Debug mode.",
      type: "boolean",
      optional: true
    },
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["сryptoсompare"],
      optional: true
    },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          asset: {
            description: "Base currency.",
            type: "currency",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "currency",
            empty: false
          }
        }
      }
    }
  },
  [TASKS_MARKETWATCHER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  },
  [TASKS_MARKETWATCHER_SUBSCRIBE_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange", empty: false },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          asset: {
            description: "Base currency.",
            type: "currency",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "currency",
            empty: false
          }
        }
      }
    }
  },
  [TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          asset: {
            description: "Base currency.",
            type: "currency",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "currency",
            empty: false
          }
        }
      }
    }
  },
  [TASKS_MARKETWATCHER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_MARKETWATCHER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_MARKETWATCHER_UPDATED_EVENT]: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export default TASKS_MARKETWATCHER_EVENTS;
