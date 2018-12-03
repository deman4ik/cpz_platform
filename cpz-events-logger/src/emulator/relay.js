import fetch from "node-fetch";
import yaml from "js-yaml";
import fs from "fs";
import retry from "cpzUtils/retry";

const endpointsConfig = yaml.safeLoad(
  fs.readFileSync(`${process.cwd()}/endpoints.yml`, "utf8")
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

export default relay;
