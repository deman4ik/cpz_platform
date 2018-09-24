const fetch = require("node-fetch");
const yaml = require("js-yaml");
const fs = require("fs");
const retry = require("../utils/retry");

const endpointsConfig = yaml.safeLoad(
  fs.readFileSync(`${process.cwd()}/emulator/endpoints.yml`, "utf8")
);

const findEndpoint = eventType =>
  endpointsConfig.endpoints.find(endpoint =>
    endpoint.types.find(type => type === eventType)
  );

async function relay(context, event) {
  try {
    const endpoint = findEndpoint(event.eventType);

    if (endpoint) {
      const url = `http://${endpoint.container_name}:80${endpoint.url}`;
      context.log.info(url);
      context.log.info(event);
      retry(async () => {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify([event]),
          headers: { "Content-Type": "application/json" }
        });
      });
    }
  } catch (error) {
    context.log.error(error);
  }
}

module.exports = relay;
