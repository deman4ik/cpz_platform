module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config docker.config.js --instances 3 dist/services/db",
      env: {
        NODEID: "db"
      },
      kill_timeout: 11000
    },
    {
      name: "backtester-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/backtester/backtester-worker.service.js",
      env: {
        NODEID: "backtester-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "public-connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/connector/public-connector.service.js",
      env: {
        NODEID: "public-connector"
      },
      kill_timeout: 11000
    },
    {
      name: "private-connector-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env  --config docker.config.js --instances 3 dist/services/connector/private-connector-worker.service.js",
      env: {
        NODEID: "private-connector-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "exwatcher-binance_futures",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/binance-futures-watcher.service.js",
      env: {
        NODEID: "exwatcher-binance_futures"
      },
      kill_timeout: 11000
    },
    {
      name: "exwatcher-bitfinex",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/bitfinex-watcher.service.js",
      env: {
        NODEID: "exwatcher-bitfinex"
      },
      kill_timeout: 11000
    },
    {
      name: "exwatcher-kraken",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/kraken-watcher.service.js",
      env: {
        NODEID: "exwatcher-kraken"
      },
      kill_timeout: 11000
    },
    {
      name: "importer-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/importer/importer-worker.service.js",
      env: {
        NODEID: "importer-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/robot/robot-worker.service.js",
      env: {
        NODEID: "robot-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "user-robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/userRobot/user-robot-worker.service.js",
      env: {
        NODEID: "user-robot-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "stats-calc-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 3 dist/services/statsCalc/stats-calc-worker.service.js",
      env: {
        NODEID: "stats-calc-worker"
      },
      kill_timeout: 11000
    },
    {
      name: "publisher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js --instances 2 dist/services/publisher.service.js dist/services/mail.service.js",
      env: {
        NODEID: "publisher"
      },
      kill_timeout: 11000
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config api.docker.config.js --instances 2 dist/services/api.service.js dist/services/auth.service.js dist/services/backtester/backtester-runner.service.js dist/services/connector/private-connector-runner.service.js dist/services/exwatcher/exwatcher-runner.service.js dist/services/importer/importer-runner.service.js dist/services/robot/robot-runner.service.js dist/services/userRobot/user-robot-runner.service.js dist/services/statsCalc/stats-calc-runner.service.js",
      env: {
        NODEID: "api"
      },
      kill_timeout: 11000
    },
    {
      name: "telegram",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/telegram/bot.service.js",
      env: {
        NODEID: "telegram"
      },
      kill_timeout: 11000
    }
  ]
};
