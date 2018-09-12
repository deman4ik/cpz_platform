const baseEventSchema = {
  id: {
    description: "An unique identifier for the event.",
    type: "string"
  },
  topic: {
    description: "The resource path of the event source.",
    type: "string"
  },
  subject: {
    description: "A resource path relative to the topic path.",
    type: "string"
  },
  data: {
    description: "Event data specific to the event type.",
    type: "object"
  },
  eventType: {
    description: "The type of the event that occurred.",
    type: "string"
  },
  eventTime: {
    description: "The time (in UTC) the event was generated.",
    format: "date-time",
    type: "string"
  },
  metadataVersion: {
    description: "The schema version of the event metadata.",
    readOnly: true,
    type: "string"
  },
  dataVersion: {
    description: "The schema version of the data object.",
    type: "string"
  }
};

const tasks = {
  topic: "CPZ-TASKS",
  events: [
    {
      eventType: "CPZ.Tasks.MarketWatcher.Start",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
          description: "Data provider type. - 'typeDataProvider'",
          type: "string",
          values: ["CryptoCompare"]
        },
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency. - 'baseq'", type: "string" },
        currency: { description: "Quote currency. - 'quote'", type: "string" }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Stop",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Subscribe",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
        },
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency. - 'baseq'", type: "string" },
        currency: { description: "Quote currency. - 'quote'", type: "string" }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Unsubsribe",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
        },
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency. - 'baseq'", type: "string" },
        currency: { description: "Quote currency. - 'quote'", type: "string" }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Started",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
        },
        rowKey: {
          description: "Table storage uniq row key.",
          type: "string"
        },
        partitionKey: {
          description: "Table storage partition key.",
          type: "string"
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
            input: {
              description: "Data input from Start event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Stopped",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
            input: {
              description: "Data input from Stop event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Subscribed",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
            input: {
              description: "Data input from Subscribe event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.MarketWatcher.Unsubscribed",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
            input: {
              description: "Data input from Unsubscribe event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Start",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframes: {
          description: "List of timeframes in minutes.",
          type: "array",
          items: "number"
        },
        providerType: {
          description: "Data provider type.",
          type: "string",
          values: ["CryptoCompare", "CCXT"]
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Stop",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Update",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframes: {
          description: "List of timeframes in minutes.",
          type: "array",
          items: "number"
        },
        providerType: {
          description: "Data provider type.",
          type: "string",
          values: ["CryptoCompare", "CCXT"]
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Started",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
        },
        rowKey: {
          description: "Table storage uniq row key.",
          type: "string"
        },
        partitionKey: {
          description: "Table storage partition key.",
          type: "string"
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
            input: {
              description: "Data input from Start event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Stopped",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
            input: {
              description: "Data input from Stop event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Candlebatcher.Updated",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id. - 'nameProvider'",
          type: "string"
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
            input: {
              description: "Data input from Update event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Start",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframe: {
          description: "Timeframe in minutes.",
          type: "number"
        },
        robotId: {
          description: "Robot uniq Id.",
          type: "string"
        },
        strategy: {
          description: "Strategy file name.",
          type: "string"
        },
        indicatorsParams: {
          description: "Inicators parameters.",
          type: "object"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Stop",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Update",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframe: {
          description: "Timeframe in minutes.",
          type: "number"
        },
        robotId: {
          description: "Robot uniq Id.",
          type: "string"
        },
        strategy: {
          description: "Strategy file name.",
          type: "string"
        },
        indicatorsParams: {
          description: "Inicators parameters.",
          type: "object"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Started",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        },
        rowKey: {
          description: "Table storage uniq row key.",
          type: "string"
        },
        partitionKey: {
          description: "Table storage partition key.",
          type: "string"
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
            input: {
              description: "Data input from Start event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Stopped",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
            input: {
              description: "Data input from Stop event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Adviser.Updated",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
            input: {
              description: "Data input from Update event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Start",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframe: {
          description: "Timeframe in minutes.",
          type: "number"
        },
        robotId: {
          description: "Robot uniq Id. - 'AdvisorName'",
          type: "string"
        },
        userId: {
          description: "User uniq Id.",
          type: "string"
        },
        params: {
          description: "Trader parameters.",
          type: "object",
          props: {
            slippageStep: {
              description: "Price Slippage Step.",
              type: "number"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Stop",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Update",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        },
        debug: {
          description: "Debug mode.",
          type: "boolean"
        },
        params: {
          description: "Trader parameters.",
          type: "object",
          props: {
            slippageStep: {
              description: "Price Slippage Step.",
              type: "number"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Started",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
        },
        rowKey: {
          description: "Table storage uniq row key.",
          type: "string"
        },
        partitionKey: {
          description: "Table storage partition key.",
          type: "string"
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
            input: {
              description: "Data input from Start event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Stopped",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
            input: {
              description: "Data input from Stop event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    },
    {
      eventType: "CPZ.Tasks.Trader.Updated",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        taskId: {
          description: "Uniq task id.",
          type: "string"
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
            input: {
              description: "Data input from Update event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    }
  ]
};

const ticks = {
  topic: "CPZ-TICKS",
  events: [
    {
      eventType: "CPZ.Ticks.NewTick",
      subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}",
      dataSchema: {
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        side: {
          description: "Trade side.",
          type: "string",
          values: ["buy", "sell"]
        },
        tradeId: {
          description: "Trade ID.",
          type: "string"
        },
        time: { description: "Trade time in seconds.", type: "number" },
        volume: { description: "Trade Volume.", type: "number" },
        price: { description: "Trade Price.", type: "number" }
      }
    }
  ]
};

const candles = {
  topic: "CPZ-CANDLES",
  events: [
    {
      eventType: "CPZ.Candles.NewCandle",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        candleId: { description: "Uniq Candle Id.", type: "string" },
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframe: {
          description: "Timeframe in minutes.",
          type: "number"
        },
        time: { description: "Candle time in seconds.", type: "number" },
        open: { description: "Candle Open Price.", type: "number" },
        close: { description: "Candle Close Price.", type: "number" },
        high: { description: "Candle Highest Price.", type: "number" },
        low: { description: "Trade Lowest Price.", type: "number" },
        volume: { description: "Candle Volume.", type: "number" }
      }
    },
    {
      eventType: "CPZ.Candles.Handled",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        candleId: { description: "Uniq Candle Id.", type: "string" },
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
            input: {
              description: "Data input from NewCandle event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    }
  ]
};

const signals = {
  topic: "CPZ-SIGNALS",
  events: [
    {
      eventType: "CPZ.Signals.NewSignal",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        signalId: { description: "Uniq Candle Id.", type: "string" },
        exchange: { description: "Exchange code.", type: "string" },
        asset: { description: "Base currency.", type: "string" },
        currency: { description: "Quote currency.", type: "string" },
        timeframe: {
          description: "Timeframe in minutes.",
          type: "number"
        },
        robotId: {
          description: "Robot uniq Id.",
          type: "string"
        },
        adviserId: {
          description: "Adviser task Id.",
          type: "string"
        },
        alertTime: {
          description: "Signal time in seconds.",
          type: "number"
        },
        action: {
          description: "Signal type.",
          type: "string",
          values: ["long", "closeLong", "short", "closeShort"]
        },
        qty: {
          description: "Volume.",
          type: "number",
          optional: true
        },
        orderType: {
          description: "Order type.",
          type: "string",
          values: ["stop", "limit", "market"],
          optional: true
        },
        proce: {
          description: "Price in quote currency.",
          type: "number"
        },
        priceSource: {
          description: "Candle field.",
          type: "string",
          values: ["open", "close", "high", "low", "stop"]
        },
        positionId: {
          description: "Uniq position Id",
          type: "number"
        },
        candle: {
          description: "Signal from Candle.",
          type: "object",
          props: {
            time: { description: "Candle time in seconds.", type: "number" },
            open: { description: "Candle Open Price.", type: "number" },
            close: { description: "Candle Close Price.", type: "number" },
            high: { description: "Candle Highest Price.", type: "number" },
            low: { description: "Trade Lowest Price.", type: "number" },
            volume: { description: "Candle Volume.", type: "number" }
          },
          optional: true
        },
        params: {
          description: "Additinal params",
          type: "object"
        }
      }
    },
    {
      eventType: "CPZ.Signals.Handled",
      subject: "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}",
      dataSchema: {
        signalId: { description: "Uniq Signal Id.", type: "string" },
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
            input: {
              description: "Data input from NewSignal event.",
              type: "object"
            }
          },
          optional: true
        }
      }
    }
  ]
};
module.exports = { baseEventSchema, tasks, ticks, candles, signals };
