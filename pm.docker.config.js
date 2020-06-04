module.exports = {
  apps: [
    {
      name: "db",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config dev.config.js dist/services/db"
    },
    {
      name: "api",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args:
        "--env --config api.docker.config.js dist/services/api.service.js dist/services/auth.service.js"
    }
  ]
};
