import fetch from "node-fetch";
import retry from "cpz/utils/retry";
import Log from "cpz/log";
import eventEndpoints from "cpz/events/endpoints";
import { SERVICE_NAME } from "../config";

class Relay {
  constructor(mode, key) {
    this._mode = mode;
    this._key = key;
    this._endpoints = [];
    if (this._mode) {
      this._init();
    }
  }

  _init() {
    Object.keys(eventEndpoints).forEach(service => {
      if (service === SERVICE_NAME) return;
      const serviceEndpoints = eventEndpoints[service];
      serviceEndpoints.forEach(endpoint => {
        this._endpoints.push({
          service,
          url: `http://${
            this._mode === "docker"
              ? `cpz-${service}:80`
              : `localhost:${endpoint.localPort}`
          }${endpoint.url}?api-key=${this._key}`,
          types: endpoint.types
        });
      });
    });
  }

  _findEndpoints(eventType) {
    return this._endpoints.filter(endpoint =>
      endpoint.types.find(type => type === eventType)
    );
  }

  async send(event) {
    try {
      if (this._mode) {
        const endpoints = this._findEndpoints(event.eventType);
        if (endpoints && endpoints.length > 0) {
          await Promise.all(
            endpoints.map(async endpoint => {
              await retry(async () => {
                await fetch(endpoint.url, {
                  method: "POST",
                  body: JSON.stringify([
                    {
                      ...event,
                      topic: "cpz-events-logger",
                      metadataVersion: "1"
                    }
                  ]),
                  headers: { "Content-Type": "application/json" }
                });
              });
            })
          );
        }
      }
    } catch (error) {
      Log.error(error);
    }
  }
}

export default Relay;
