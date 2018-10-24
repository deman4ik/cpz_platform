import { BASE_ERROR } from "./events";

const TASKS_MARKETWATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    provider: {
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
          exchange: {
            description: "Exchange code.",
            type: "string",
            empty: false
          },
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
    },
    hostId: {
      description: "Uniq host id.",
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
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          exchange: {
            description: "Exchange code.",
            type: "string",
            empty: false
          },
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
  eventType: "CPZ.Tasks.Marketwatcher.Unsubsribe",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    subscriptions: {
      description: "Data subscriptions list",
      type: "array",
      items: {
        type: "object",
        props: {
          exchange: {
            description: "Exchange code.",
            type: "string",
            empty: false
          },
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
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
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
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_MARKETWATCHER_SUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Subscribed",

  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
      type: "string",
      empty: false
    },
    hostId: {
      description: "Uniq host id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.Marketwatcher.Unsubscribed",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    hostId: {
      description: "Uniq host id.",
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
  TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT
};
