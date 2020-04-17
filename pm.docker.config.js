module.exports = {
  apps: [
    {
      name: "app",
      script: "./node_modules/moleculer/bin/moleculer-runner.js",
      args: "--env --config docker.config.js",
      kill_timeout: 11000
    }
  ]
};
