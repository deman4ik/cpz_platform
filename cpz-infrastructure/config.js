const config = {
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
          "CPZ.Tasks.MarketWatcher.Stoped"
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
          "CPZ.Candles.NewCandle"
        ]
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
        types: ["CPZ.Tasks.Adviser.Started", "CPZ.Tasks.Adviser.Stoped"]
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
        types: ["CPZ.Tasks.Trader.Started", "CPZ.Tasks.Trader.Stoped"]
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
  }
};

module.exports = config;
