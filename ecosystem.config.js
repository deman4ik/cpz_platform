module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/db",
      env: {
        NODE_ENV: "development",
        NODEID: "db"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "backtester",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/backtester",
      env: {
        NODE_ENV: "development",
        NODEID: "backtester"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "connector",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/connector",
      env: {
        NODE_ENV: "development",
        NODEID: "connector"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "exwatcher",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/exwatcher.service.js",
      env: {
        NODE_ENV: "development",
        NODEID: "exwatcher"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "importer",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config prod.config.js dist/services/importer",
      env: {
        NODE_ENV: "development",
        NODEID: "importer"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "robot-runner",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/robot/robot-runner.service.js",
      env: {
        NODE_ENV: "development",
        NODEID: "robot-runner"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "robot-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config --prod.config.js --instances=2 dist/services/robot/robot-worker.service.js",
      env: {
        NODE_ENV: "development",
        NODEID: "robot-worker"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/api.service.js dist/services/auth.service.js",
      env: {
        NODE_ENV: "development",
        NODEID: "api"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    ,
    {
      name: "telegram",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/telegram/bot.service.js",
      env: {
        NODE_ENV: "development",
        NODEID: "telegram"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
