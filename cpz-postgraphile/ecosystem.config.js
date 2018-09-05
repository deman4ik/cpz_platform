module.exports = {
  apps: [
    {
      name: "cpz-postgraphile",
      script: "server.js",
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
