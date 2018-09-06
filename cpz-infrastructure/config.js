const config = {
  taskrunner: {
    name: "CPZ-Taskrunner",
    description: "Generate Taks events, checks service status",
    directory: "/cpz-taskrunner",
    localUrlPostfix: "/taskrunner",
    apiEndpoints: [
      {
        name: "Get current status of any service",
        url: "/api/status",
        method: "GET"
      },
      {
        name: "Start any service",
        url: "/api/start",
        method: "POST"
      },
      {
        name: "Stop any service",
        url: "/api/stop",
        method: "POST"
      }
    ],
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Started",
          "CPZ.Tasks.MarketWatcher.Stopped",
          "CPZ.Tasks.MarketWatcher.Subscribed",
          "CPZ.Tasks.MarketWatcher.Unsubscribed",
          "CPZ.Tasks.Adviser.Started",
          "CPZ.Tasks.Adviser.Stopped",
          "CPZ.Tasks.Trader.Started",
          "CPZ.Tasks.Trader.Stopped"
        ]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Taskrunner.Log", "CPZ.Taskrunner.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Start",
          "CPZ.Tasks.MarketWatcher.Stop",
          "CPZ.Tasks.MarketWatcher.Subscribe",
          "CPZ.Tasks.MarketWatcher.Unsubscribe",
          "CPZ.Tasks.Adviser.Start",
          "CPZ.Tasks.Adviser.Stop",
          "CPZ.Tasks.Trader.Start",
          "CPZ.Tasks.Trader.Stop"
        ]
      }
    ],
    storageTables: ["Tasks"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY"
    ]
  },
  importer: {
    name: "CPZ-Importer",
    description: "Request history data and saves to postgresql",
    directory: "/cpz-importer",
    localUrlPostfix: "/importer",
    apiEndpoints: [
      {
        name: "Importer current status",
        url: "/api/status",
        method: "GET"
      }
    ],
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Importer.Start", "CPZ.Tasks.Importer.Stop"]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Importer.Log", "CPZ.Importer.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Importer.Started", "CPZ.Tasks.Importer.Stopped"]
      }
    ],
    storageTables: ["Importers"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY"
    ]
  },
  marketWatcher: {
    name: "CPZ-MarketWatcher",
    description: "Subscribe to market data, generate candles and ticks",
    directory: "/cpz-marketWatcher",
    localUrlPostfix: "/marketwatcher",
    apiEndpoints: [
      {
        name: "MarketWatcher current status",
        url: "/api/status",
        method: "GET"
      }
    ],
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Start",
          "CPZ.Tasks.MarketWatcher.Stop",
          "CPZ.Tasks.MarketWatcher.Subscribe",
          "CPZ.Tasks.MarketWatcher.Unsubscribe"
        ]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.MarketWatcher.Log", "CPZ.MarketWatcher.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Started",
          "CPZ.Tasks.MarketWatcher.Stopped"
        ]
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle"]
      },
      {
        topic: "CPZ-TICKS",
        types: ["CPZ.Ticks.NewTick"]
      }
    ],
    storageTables: ["MarketWatchers"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY",
      "EG_CANDLES_ENDPOINT",
      "EG_CANDLES_KEY",
      "EG_TICKS_ENDPOINT",
      "EG_TICKS_KEY"
    ]
  },
  candlebatcher: {
    name: "CPZ-Candlebatcher",
    description:
      "Handle candles, save them to postgre, generate candles in different timeframes",
    directory: "/cpz-candlebatcher",
    localUrlPostfix: "/candlebatcher",
    egIn: [
      {
        name: "EventGrid Candles Handler",
        url: "/api/candleEvents",
        method: "POST",
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle"]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Candlebatcher.Log", "CPZ.Candlebatcher.Error"]
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle", "CPZ.Candles.CandleSaved"]
      }
    ],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_CANDLES_ENDPOINT",
      "EG_CANDLES_KEY",
      "DB_API_ENDPOINT",
      "DB_API_KEY"
    ]
  },
  backtester: {
    name: "CPZ-Backtester",
    description: "Run backtests, generate candles",
    directory: "/cpz-backtester",
    localUrlPostfix: "/backtester",
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Backtester.Start", "CPZ.Tasks.Backtester.Stop"]
      },
      {
        name: "EventGrid Candles Handler",
        url: "/api/candleEvents",
        method: "POST",
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.Handled"]
      },
      {
        name: "EventGrid Signals Handler",
        url: "/api/signalEvents",
        method: "POST",
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal", "CPZ.Signals.Handled"]
      },
      {
        name: "EventGrid Orders Handler",
        url: "/api/orderEvents",
        method: "POST",
        topic: "CPZ-ORDERS",
        types: ["CPZ.Orders.NewOpenOrder", "CPZ.Orders.NewCloseOrder"]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Backtester.Log", "CPZ.Backtester.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Backtester.Started", "CPZ.Tasks.Backtester.Stopped"]
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle"]
      }
    ],
    storageTables: ["Backtesters"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY",
      "EG_CANDLES_ENDPOINT",
      "EG_CANDLES_KEY"
    ]
  },
  adviser: {
    name: "CPZ-Adviser",
    description: "Handle candles, run strategies, generate signals",
    directory: "/cpz-adviser",
    localUrlPostfix: "/adviser",
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Adviser.Start", "CPZ.Tasks.Adviser.Stop"]
      },
      {
        name: "EventGrid Candles Handler",
        url: "/api/candleEvents",
        method: "POST",
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle"]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Adviser.Log", "CPZ.Adviser.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Adviser.Started", "CPZ.Tasks.Adviser.Stopped"]
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.Handled"]
      },
      {
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal"]
      }
    ],
    storageTables: ["Advisers"],
    storageQueues: ["CandlesPending"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY",
      "EG_CANDLES_ENDPOINT",
      "EG_CANDLES_KEY",
      "EG_SIGNALS_ENDPOINT",
      "EG_SIGNALS_KEY"
    ]
  },
  trader: {
    name: "CPZ-Trader",
    description: "Handle signals, generate orders",
    directory: "/cpz-trader",
    localUrlPostfix: "/trader",
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Trader.Start", "CPZ.Tasks.Trader.Stop"]
      },
      {
        name: "EventGrid Signals Handler",
        url: "/api/signalEvents",
        method: "POST",
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal"]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Trader.Log", "CPZ.Trader.Error"]
      },
      {
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Trader.Started", "CPZ.Tasks.Trader.Stopped"]
      },
      {
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.Handled"]
      },
      {
        topic: "CPZ-ORDERS",
        types: ["CPZ.Orders.NewOpenOrder", "CPZ.Orders.NewCloseOrder"]
      }
    ],
    storageTables: ["Traders"],
    storageQueues: ["SignalsPending"],
    environmentVariables: [
      "AZ_STORAGE_CS",
      "API_KEY",
      "EG_TEST_ENDPOINT",
      "EG_TEST_KEY",
      "EG_LOG_ENDPOINT",
      "EG_LOG_KEY",
      "EG_TASKS_ENDPOINT",
      "EG_TASKS_KEY",
      "EG_SIGNALS_ENDPOINT",
      "EG_SIGNALS_KEY",
      "EG_ORDERS_ENDPOINT",
      "EG_ORDERS_KEY"
    ]
  },
  postgraphile: {
    name: "CPZ-Postgraphile",
    description: "GraphQL API for PostreSQL",
    directory: "/cpz-postgraphile",
    localUrlPostfix: "/postgraphile",
    apiEndpoints: [
      {
        name: "Graphql endpoint",
        url: "/graphql",
        method: "POST"
      }
    ],
    environmentVariables: ["API_KEY", "CUSTOMCONNSTR_POSTGRESQL"]
  }
};

module.exports = config;
