import msRestAzure from "ms-rest-azure";
import EventGrid from "azure-eventgrid";
import url from "url";
import { v4 as uuid } from "uuid";
import ServiceError from "../error";
import retry from "../utils/retry";
import Log from "../log";
import ServiceValidator from "../validator";

class EG {
  constructor() {
    this._clients = {};
    this._commonProps = {};
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
      const newEvent = this._mergeEventData(eventData);
      ServiceValidator.check(newEvent.eventType, newEvent.data);

      await retry(
        async () => {
          const { client, host } = this._clients[topic];
          await client.publishEvents(host, [newEvent]);
        },
        {
          retries: 2,
          minTimeout: 200,
          maxTimeout: 1000
        }
      );
    } catch (error) {
      const err = new ServiceError(
        {
          name: ServiceError.types.EVENTGRID_PUBLISH_ERROR,
          cause: error,
          info: {
            topic,
            eventData
          }
        },
        'Failed to publish event to topic "%s"',
        topic
      );
      Log.error(err);
      throw err;
    }
  }
}

const eventgrid = new EG();

export default eventgrid;
