module.exports = {
  apps: [
    {
      name: "db-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/db",
      env: {
        NODE_ENV: "production",
        NODEID: "db-1"
      }
    },
    {
      name: "db-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/db",
      env: {
        NODE_ENV: "production",
        NODEID: "db-2"
      }
    },
    {
      name: "db-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/db",
      env: {
        NODE_ENV: "production",
        NODEID: "db-3"
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
      name: "backtester-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/backtester/backtester-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-worker-1"
      }
    },
    {
      name: "backtester-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/backtester/backtester-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-worker-2"
      }
    },
    {
      name: "backtester-worker-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/backtester/backtester-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "backtester-worker-3"
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
      name: "private-connector-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/connector/private-connector-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-runner"
      }
    },
    {
      name: "private-connector-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env  --config prod.config.js dist/services/connector/private-connector-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-worker-1"
      }
    },
    {
      name: "private-connector-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env  --config prod.config.js dist/services/connector/private-connector-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-worker-2"
      }
    },
    {
      name: "private-connector-worker-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env  --config prod.config.js dist/services/connector/private-connector-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "private-connector-worker-3"
      }
    },
    {
      name: "exwatcher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/exwatcher.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "exwatcher"
      }
    },
    {
      name: "importer-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/importer/importer-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer-runner"
      }
    },
    {
      name: "importer-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/importer/importer-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer-worker-1"
      }
    },
    {
      name: "importer-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/importer/importer-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer-worker-2"
      }
    },
    {
      name: "importer-worker-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/importer/importer-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer-worker-3"
      }
    },
    {
      name: "robot-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-runner"
      }
    },
    {
      name: "robot-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-worker-1"
      }
    },
    {
      name: "robot-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-worker-2"
      }
    },
    {
      name: "robot-worker-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "robot-worker-3"
      }
    },
    {
      name: "user-robot-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/userRobot/user-robot-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-runner"
      }
    },
    {
      name: "user-robot-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/userRobot/user-robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-worker-1"
      }
    },
    {
      name: "user-robot-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/userRobot/user-robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-worker-2"
      }
    },
    {
      name: "user-robot-worker-3",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/userRobot/user-robot-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "user-robot-worker-3"
      }
    },
    {
      name: "stats-calc-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/statsCalc/stats-calc-runner.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc-runner"
      }
    },
    {
      name: "stats-calc-worker-1",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/statsCalc/stats-calc-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc-worker-1"
      }
    },
    {
      name: "stats-calc-worker-2",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/statsCalc/stats-calc-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "stats-calc-worker-2"
      }
    },
    {
      name: "publisher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/publisher.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "publisher"
      }
    },
    {
      name: "mail",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/mail.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "mail"
      }
    },
    {
      name: "trace-logger",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/trace-logger.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "trace-logger"
      }
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/api.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "api"
      }
    },
    {
      name: "auth",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/auth.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "auth"
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
