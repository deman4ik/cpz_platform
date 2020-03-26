module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/db",
      env: {
        NODE_ENV: "production",
        NODEID: "db"
      }
    },
    {
      name: "backtester-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/backtester/backtester-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-runner"
      }
    },
    {
      name: "backtester-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js --instances=3 dist/services/backtester/backtester-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-worker"
      }
    },
    {
      name: "public-connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/connector/public-connector.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "public-connector"
      }
    },
    {
      name: "private-connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/connector/private-connector-runner.service.js dist/services/connector/private-connector-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector"
      }
    },
    {
      name: "exwatcher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/exwatcher",
      env: {
        NODE_ENV: "production",
        NODEID: "exwatcher"
      }
    },
    {
      name: "importer",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/importer/importer-runner.service.js dist/services/importer/importer-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer"
      }
    },
    {
      name: "robot",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-runner.service.js dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot"
      }
    },
    {
      name: "user-robot",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/userRobot/user-robot-runner.service.js dist/services/userRobot/user-robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot"
      }
    },
    {
      name: "stats-calc",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/statsCalc/stats-calc-runner.service.js dist/services/statsCalc/stats-calc-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc"
      }
    },
    {
      name: "publisher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/publisher.service.js dist/services/mail.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "publisher"
      }
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/api.service.js dist/services/auth.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "api"
      }
    },
    {
      name: "telegram",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/telegram/bot.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "telegram"
      }
    }
  ]
};
