module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config docker.config.js dist/services/db"
    },
    {
      name: "backtester-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/backtester/backtester-worker.service.js"
    },
    {
      name: "public-connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/connector/public-connector.service.js"
    },
    {
      name: "private-connector-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/connector/private-connector-worker.service.js"
    },
    {
      name: "exwatcher-binance_futures",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/binance-futures-watcher.service.js"
    },
    {
      name: "exwatcher-bitfinex",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/bitfinex-watcher.service.js"
    },
    {
      name: "exwatcher-kraken",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/db/candles dist/services/exwatcher/kraken-watcher.service.js"
    },
    {
      name: "importer-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/importer/importer-worker.service.js"
    },
    {
      name: "robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/robot/robot-worker.service.js"
    },
    {
      name: "user-robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/userRobot/user-robot-worker.service.js"
    },
    {
      name: "stats-calc-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/statsCalc/stats-calc-worker.service.js"
    },
    {
      name: "publisher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/publisher.service.js dist/services/mail.service.js"
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config api.docker.config.js dist/services/api.service.js dist/services/auth.service.js dist/services/backtester/backtester-runner.service.js dist/services/connector/private-connector-runner.service.js dist/services/exwatcher/exwatcher-runner.service.js dist/services/importer/importer-runner.service.js dist/services/robot/robot-runner.service.js dist/services/userRobot/user-robot-runner.service.js dist/services/statsCalc/stats-calc-runner.service.js"
    },
    {
      name: "telegram",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config docker.config.js dist/services/telegram/bot.service.js"
    }
  ]
};
