const TASKS_CANDLEBATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
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
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["cryptocompare", "ccxt"]
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframes: {
      description: "List of timeframes in minutes.",
      type: "array",
      items: "number"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};
const TASKS_CANDLEBATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stop",
  subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
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
    }
  }
};
const TASKS_CANDLEBATCHER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Update",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
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
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    timeframes: {
      description: "List of timeframes in minutes.",
      type: "array",
      items: "number"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};
const TASKS_CANDLEBATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Started",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
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
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
const TASKS_CANDLEBATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};
const TASKS_CANDLEBATCHER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Updated",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: {
      type: "object",
      description: "Error object if something goes wrong.",
      props: {
        code: {
          description: "Error code.",
          type: "string",
          empty: false
        },
        message: {
          description: "Error message.",
          type: "string",
          empty: false
        },
        detail: {
          description: "Error detail.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  }
};

export {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT
};
