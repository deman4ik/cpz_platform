import msRestAzure from "ms-rest-azure";
import EventGrid from "azure-eventgrid";
import url from "url";
import { v4 as uuid } from "uuid";
import VError from "verror";
import { createErrorOutput } from "../utils/error";
import retry from "../utils/retry";
import { createValidator, genErrorIfExist } from "../utils/validation";

class EG {
  constructor() {
    this._clients = {};
    this._commonProps = {};
    this._validateConfig = createValidator(EG.configValidationSchema);
  }

  static get configValidationSchema() {
    return {
      topics: {
        description: "Event Grid client configuration",
        type: "array",
        items: {
          type: "object",
          props: {
            name: { type: "string", empty: false },
            endpoint: { type: "string", empty: false },
            key: { type: "string", empty: false }
          }
        }
      },
      commonProps: {
        description: "Common properties",
        type: "object",
        optional: true
      }
    };
  }

  static get baseEvent() {
    return {
      id: uuid(),
      metadataVersion: "1",
      dataVersion: "1.0",
      eventTime: new Date()
    };
  }

  _createClient(key) {
    return new EventGrid(new msRestAzure.TopicCredentials(key));
  }

  _getHost(endpoint) {
    return url.parse(endpoint, true).host;
  }

  /**
   * Конфигурация EventGrid
   *
   * @param {object[]} topics
   *  @property {string} name
   *  @property {string} endpoint
   *  @property {string} key
   * @memberof EventGrid
   */
  config(topics, commonProps) {
    genErrorIfExist(this._validateConfig({ topics, commonProps }));
    topics.forEach(topic => {
      this._clients[topic.name] = {
        client: this._createClient(topic.key),
        endpoint: this._getHost(topic.endpoint)
      };
    });
    if (commonProps) this._commonProps = commonProps;
  }

  _mergeEventData(event) {
    return {
      ...event,
      ...EG.baseEvent,
      data: { ...event.data, ...this._commonProps }
    };
  }

  async publish(topic, eventData) {
    try {
      // TODO: Validation
      let events = [];
      if (Array.isArray(eventData)) {
        events = eventData.map(this._mergeEventData);
      } else {
        const newEvent = this._mergeEventData(eventData);
        events.push(newEvent);
      }
      await retry(
        async () => {
          const { client, host } = this._clients[topic];
          await client.publishEvents(host, events);
        },
        {
          retries: 2,
          minTimeout: 200,
          maxTimeout: 1000
        }
      );
    } catch (error) {
      const err = new VError(
        {
          name: "EventGridPublishError",
          cause: error,
          info: {
            topic,
            eventData
          }
        },
        'Failed to publish event to topic "%s"',
        topic
      );
      const errorOutput = createErrorOutput(err);
      console.error(errorOutput);
      throw err;
    }
  }
}

const eventgrid = new EG();

export default eventgrid;
