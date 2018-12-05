import { BASE_ERROR } from "./events";

const TASKS_MARKETWATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["сryptoсompare"]
    },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          asset: {
            description: "Base currency.",
            type: "string",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "string",
            empty: false
          }
        }
      }
    }
  }
};
const TASKS_MARKETWATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_MARKETWATCHER_SUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Subscribe",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          asset: {
            description: "Base currency.",
            type: "string",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "string",
            empty: false
          }
        }
      }
    }
  }
};
const TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Unsubscribe",

  dataSchema: {
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
            type: "string",
            empty: false
          },
          currency: {
            description: "Quote currency.",
            type: "string",
            empty: false
          }
        }
      }
    }
  }
};
const TASKS_MARKETWATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Started",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_MARKETWATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_MARKETWATCHER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Updated",

  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UPDATED_EVENT
};
