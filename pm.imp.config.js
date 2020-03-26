module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js dist/services/db/candles dist/services/db/db-importers dist/services/db/db-markets dist/services/db/user/db-users",
      env: {
        NODE_ENV: "production",
        NODEID: "db"
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
      name: "importer-worker",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config prod.config.js --instances=8 dist/services/importer/importer-worker.service.js",
      env: {
        NODE_ENV: "production",
        NODEID: "importer-worker"
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
    }
  ]
};
