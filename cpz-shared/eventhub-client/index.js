import { EventHubClient } from "@azure/event-hubs";

class EventHub {
  constructor() {
    this._client = null;
  }

  init(connectionString, name) {
    this._client = EventHubClient.createFromConnectionString(
      connectionString,
      name
    );
  }

  async send(partitionKey, body) {
    const message = {
      partitionKey,
      body
    };
    await this._client.send(message);
  }
}

const client = new EventHub();
export default client;
