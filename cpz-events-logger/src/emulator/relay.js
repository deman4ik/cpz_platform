import fetch from "node-fetch";
import yaml from "js-yaml";
import fs from "fs";
import retry from "cpzUtils/retry";

const { EG_EMULATOR_MODE } = process.env;

let endpointsConfig = {};
// TODO: Build from config
if (EG_EMULATOR_MODE)
  endpointsConfig = yaml.safeLoad(
    fs.readFileSync(
      `${process.cwd()}/endpoints-${EG_EMULATOR_MODE}.yml`,
      "utf8"
    )
  );

const findEndpoint = eventType =>
  endpointsConfig.endpoints.find(endpoint =>
    endpoint.types.find(type => type === eventType)
  );

async function relay(context, event) {
  try {
    const endpoint = findEndpoint(event.eventType);
    if (endpoint) {
      const host =
        EG_EMULATOR_MODE === "docker"
          ? `${endpoint.endpoint}:${endpoint.port}`
          : `localhost:${endpoint.port}`;
      const url = `http://${host}${endpoint.url}?api-key=${
        process.env.API_KEY
      }`;
      context.log.info(url);
      context.log.info(event);
      retry(async () => {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify([
            { ...event, topic: "cpz-events-logger", metadataVersion: "1" }
          ]),
          headers: { "Content-Type": "application/json" }
        });
      });
    }
  } catch (error) {
    context.log.error(error);
  }
}

export default relay;
