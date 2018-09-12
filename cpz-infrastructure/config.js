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
      },
      {
        name: "Update any services configuration",
        url: "/api/update",
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
          "CPZ.Tasks.Candlebatcher.Started",
          "CPZ.Tasks.Candlebatcher.Stopped",
          "CPZ.Tasks.Candlebatcher.Updated",
          "CPZ.Tasks.Adviser.Started",
          "CPZ.Tasks.Adviser.Stopped",
          "CPZ.Tasks.Adviser.Updated",
          "CPZ.Tasks.Trader.Started",
          "CPZ.Tasks.Trader.Stopped",
          "CPZ.Tasks.Trader.Updated",
          "CPZ.Tasks.Backtester.Started",
          "CPZ.Tasks.Backtester.Stopped"
        ]
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Taskrunner.Log", "CPZ.Taskrunner.Error"],
        subject: "{ServiceName}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Start",
          "CPZ.Tasks.MarketWatcher.Stop",
          "CPZ.Tasks.MarketWatcher.Subscribe",
          "CPZ.Tasks.MarketWatcher.Unsubscribe",
          "CPZ.Tasks.Candlebatcher.Start",
          "CPZ.Tasks.Candlebatcher.Stop",
          "CPZ.Tasks.Candlebatcher.Update",
          "CPZ.Tasks.Adviser.Start",
          "CPZ.Tasks.Adviser.Stop",
          "CPZ.Tasks.Adviser.Update",
          "CPZ.Tasks.Trader.Start",
          "CPZ.Tasks.Trader.Stop",
          "CPZ.Tasks.Trader.Update",
          "CPZ.Tasks.Backtester.Start",
          "CPZ.Tasks.Backtester.Stop"
        ],
        subject:
          "{Exchange}/{Asset}/{Currency}/[Timeframe]/[Strategy]/{TaskId}.{B/E/R}"
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
  marketWatcher: {
    name: "CPZ-MarketWatcher",
    description: "Subscribe to realtime market data, generate ticks",
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
        ],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.MarketWatcher.Log", "CPZ.MarketWatcher.Error"],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.MarketWatcher.Started",
          "CPZ.Tasks.MarketWatcher.Stopped",
          "CPZ.Tasks.MarketWatcher.Subscribed",
          "CPZ.Tasks.MarketWatcher.Unsubscribed"
        ],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TICKS",
        types: ["CPZ.Ticks.NewTick"],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
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
      "EG_TICKS_ENDPOINT",
      "EG_TICKS_KEY",
      "PROXY_ENDPOINT"
    ]
  },
  candlebatcher: {
    name: "CPZ-Candlebatcher",
    description:
      "Request history candles, save them to postgresql, generate candles in different timeframes",
    directory: "/cpz-candlebatcher",
    localUrlPostfix: "/candlebatcher",
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.Candlebatcher.Start",
          "CPZ.Tasks.Candlebatcher.Stop",
          "CPZ.Tasks.Candlebatcher.Update",
          "CPZ.Tasks.Candlebatcher.StartImport",
          "CPZ.Tasks.Candlebatcher.StopImport",
          "CPZ.Tasks.Candlebatcher.StartBacktest",
          "CPZ.Tasks.Candlebatcher.StopBacktest"
        ],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Candlebatcher.Log", "CPZ.Candlebatcher.Error"],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.Candlebatcher.Started",
          "CPZ.Tasks.Candlebatcher.Stopped",
          "CPZ.Tasks.Candlebatcher.Updated",
          "CPZ.Tasks.Candlebatcher.StartedImport",
          "CPZ.Tasks.Candlebatcher.StoppedImport",
          "CPZ.Tasks.Candlebatcher.StartedBacktest",
          "CPZ.Tasks.Candlebatcher.StoppedBacktest"
        ],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Tasks.Candles.NewCandle"],
        subject: "{Exchange}/{Asset}/{Currency}/{TaskId}.{B/E/R}"
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
      "DB_API_KEY",
      "PROXY_ENDPOINT"
    ]
  },
  backtester: {
    name: "CPZ-Backtester",
    description: "Run backtests, saves results",
    directory: "/cpz-backtester",
    localUrlPostfix: "/backtester",
    egIn: [
      {
        name: "EventGrid Tasks Handler",
        url: "/api/taskEvents",
        method: "POST",
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Backtester.Start", "CPZ.Tasks.Backtester.Stop"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      },
      {
        name: "EventGrid Candles Handler",
        url: "/api/candleEvents",
        method: "POST",
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle", "CPZ.Candles.Handled"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      },
      {
        name: "EventGrid Signals Handler",
        url: "/api/signalEvents",
        method: "POST",
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal", "CPZ.Signals.Handled"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      },
      {
        name: "EventGrid Orders Handler",
        url: "/api/orderEvents",
        method: "POST",
        topic: "CPZ-ORDERS",
        types: ["CPZ.Orders.NewOpenOrder", "CPZ.Orders.NewCloseOrder"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Backtester.Log", "CPZ.Backtester.Error"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      },
      {
        topic: "CPZ-TASKS",
        types: ["CPZ.Tasks.Backtester.Started", "CPZ.Tasks.Backtester.Stopped"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.B"
      }
    ],
    storageTables: ["Backtests", "BacktestItems"],
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
        types: [
          "CPZ.Tasks.Adviser.Start",
          "CPZ.Tasks.Adviser.Stop",
          "CPZ.Tasks.Adviser.Update"
        ],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        name: "EventGrid Candles Handler",
        url: "/api/candleEvents",
        method: "POST",
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.NewCandle"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Adviser.Log", "CPZ.Adviser.Error"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.Adviser.Started",
          "CPZ.Tasks.Adviser.Stopped",
          "CPZ.Tasks.Adviser.Updated"
        ],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-CANDLES",
        types: ["CPZ.Candles.Handled"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
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
        types: [
          "CPZ.Tasks.Trader.Start",
          "CPZ.Tasks.Trader.Stop",
          "CPZ.Tasks.Trader.Update"
        ],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        name: "EventGrid Signals Handler",
        url: "/api/signalEvents",
        method: "POST",
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.NewSignal"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      }
    ],
    egOut: [
      {
        topic: "CPZ-LOG",
        types: ["CPZ.Trader.Log", "CPZ.Trader.Error"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-TASKS",
        types: [
          "CPZ.Tasks.Trader.Started",
          "CPZ.Tasks.Trader.Stopped",
          "CPZ.Tasks.Trader.Updated"
        ],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-SIGNALS",
        types: ["CPZ.Signals.Handled"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
      },
      {
        topic: "CPZ-ORDERS",
        types: ["CPZ.Orders.NewOpenOrder", "CPZ.Orders.NewCloseOrder"],
        subject:
          "{Exchange}/{Asset}/{Currency}/{Timeframe}/{Strategy}/{TaskId}.{B/E/R}"
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
      "EG_ORDERS_KEY",
      "CCXT_ENDPOINT",
      "KV_CLIENT_ID",
      "KV_CLIENT_SECRET"
    ]
  },
  ccxt: {
    name: "CPZ-Connector-CCXT",
    description: "HTTP API to send authenticated requests to exchanges",
    directory: "/cpz-connector-ccxt",
    localUrlPostfix: "/ccxt",
    apiEndpoints: [
      {
        name: "Create new order",
        url: "/api/setOrder",
        method: "POST"
      },
      {
        name: "Check order",
        url: "/api/checkOrder",
        method: "POST"
      },
      {
        name: "Cancele order",
        url: "/api/cancelOrder",
        method: "POST"
      }
    ],
    environmentVariables: [
      "API_KEY",
      "KV_CLIENT_ID",
      "KV_CLIENT_SECRET",
      "PROXY_ENDPOINT"
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
