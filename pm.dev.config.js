module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/db",
      env: {
        NODE_ENV: "production",
        NODEID: "db"
      }
    },
    {
      name: "backtester-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/backtester-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-runner"
      }
    },
    {
      name: "backtester-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/backtester/backtester-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-worker"
      }
    },
    {
      name: "public-connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/connector/public-connector.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "public-connector"
      }
    },
    {
      name: "private-connector-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/connector/private-connector-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-runner"
      }
    },
    {
      name: "private-connector-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/connector/private-connector-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-worker"
      }
    },
    {
      name: "exwatcher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/exwatcher.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "exwatcher"
      }
    },
    {
      name: "importer",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/importer",
      env: {
        NODE_ENV: "production",
        NODEID: "importer"
      }
    },
    {
      name: "robot-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/robot/robot-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-runner"
      }
    },
    {
      name: "robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-worker"
      }
    },
    {
      name: "user-robot-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/userRobot/user-robot-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-runner"
      }
    },
    {
      name: "user-robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/robot/user-robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-worker"
      }
    },
    {
      name: "stats-calc-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/userRobot/stats-calc-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc-runner"
      }
    },
    {
      name: "stats-calc-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/robot/stats-calc-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc-worker"
      }
    },
    {
      name: "publisher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/publisher.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "publisher"
      }
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/api.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "api"
      }
    },
    {
      name: "auth",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/auth.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "auth"
      }
    },
    {
      name: "telegram",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config dev.config.js dist/services/telegram/bot.service.js",
      env: {
        NODE_ENV: "devr",
        NODEID: "telegram"
      }
    }
  ]
};
