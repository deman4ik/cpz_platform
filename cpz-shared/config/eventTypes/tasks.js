const TASKS_MARKETWATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Start",
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
      values: ["сryptoсompare"]
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false }
  }
};
const TASKS_MARKETWATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_MARKETWATCHER_SUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Subscribe",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false }
  }
};
const TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Unsubsribe",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false }
  }
};
const TASKS_MARKETWATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Started",

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
const TASKS_MARKETWATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
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
const TASKS_MARKETWATCHER_SUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Subscribed",

  dataSchema: {
    taskId: {
      description: "Uniq task id. - 'nameProvider'",
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
const TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT = {
  eventType: "CPZ.Tasks.MarketWatcher.Unsubscribed",

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
const TASKS_ADVISER_START_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
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
      type: "boolean",
      empty: false,
      optional: true
    },
    strategyName: {
      description: "Strategy file name.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
      optional: true
    },
    requiredHistoryCache: {
      description: "Load history data from cache.",
      type: "boolean",
      optional: true,
      default: true
    },
    requiredHistoryMaxBars: {
      description: "Load history data from cache.",
      type: "number",
      integer: true,
      optional: true
    }
  }
};
const TASKS_ADVISER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stop",

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
const TASKS_ADVISER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Update",

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
    eventSubject: {
      description: "Event subject.",
      type: "string",
      optional: true
    },
    debug: {
      description: "Debug mode.",
      type: "boolean",
      optional: true
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
      optional: true
    },
    requiredHistoryCache: {
      description: "Load history data from cache.",
      type: "boolean",
      optional: true
    },
    requiredHistoryMaxBars: {
      description: "Load history data from cache.",
      type: "number",
      integer: true,
      optional: true
    }
  }
};
const TASKS_ADVISER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Started",

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
          type: "string"
        },
        message: {
          description: "Error message.",
          type: "string"
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
const TASKS_ADVISER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stopped",

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
const TASKS_ADVISER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Updated",

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
const TASKS_TRADER_START_EVENT = {
  eventType: "CPZ.Tasks.Trader.Start",

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
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    robotId: {
      description: "Robot uniq Id. - 'AdvisorName'",
      type: "string",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        volume: {
          description: "User trade volume",
          type: "number"
        }
      },
      optional: true
    }
  }
};
const TASKS_TRADER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_TRADER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Trader.Update",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    debug: {
      description: "Debug mode.",
      type: "boolean"
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        volume: {
          description: "User trade volume",
          type: "number"
        }
      },
      optional: true
    }
  }
};
const TASKS_TRADER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Started",

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
const TASKS_TRADER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stopped",

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
const TASKS_TRADER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Updated",

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
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT,
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT,
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_UPDATED_EVENT
};
