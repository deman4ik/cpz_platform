import msRestAzure from "ms-rest-azure";
import EventGrid from "azure-eventgrid";
import url from "url";
import { v4 as uuid } from "uuid";
import ServiceError from "../error";
import retry from "../utils/retry";
import Log from "../log";
import ServiceValidator from "../validator";
import typesByTopics, * as types from "./types";

/**
 * Event Grid Service Client
 *
 * @class EG
 */
class EG {
  /**
   * Creates an instance of EG.
   * @memberof EG
   */
  constructor() {
    /* List of Event Grid Clients by Topics */
    this._clients = {};

    /* Common Event Data Properties */
    this._commonProps = {};

    /* All available Topics and Event Types */
    this._typesByTopics = typesByTopics;
  }

  /**
   * Base Event Grid Event
   *
   * @readonly
   * @memberof EG
   */
  get _baseEvent() {
    return {
      id: uuid(),
      metadataVersion: "1",
      dataVersion: "1.0",
      eventTime: new Date()
    };
  }

  /**
   * Event Types
   *
   * @readonly
   * @static
   * @memberof EG
   */
  static get types() {
    return types;
  }

  /**
   * Finds Event Grid Topic for Event Type
   *
   * @param {string} eventType
   * @returns {string}
   * @memberof EG
   */
  _getTopicByEventType(eventType) {
    const topics = Object.keys(this._typesByTopics).filter(key =>
      this._typesByTopics[key].includes(eventType)
    );
    if (topics.length !== 1)
      throw new ServiceError(
        {
          name: ServiceError.types.EVENTGRID_CONFIG_ERROR,
          info: {
            eventType
          }
        },
        "Failed to find Event Grid topic for event type '%s'",
        eventType
      );
    return topics[0];
  }

  /**
   * Creates Event Grid Client
   *
   * @param {string} key
   * @returns {EventGrid}
   * @memberof EG
   */
  _createClient(key) {
    return new EventGrid(new msRestAzure.TopicCredentials(key));
  }

  /**
   * Resolves Event Grid Host
   *
   * @param {string} endpoint
   * @returns {string}
   * @memberof EG
   */
  _getHost(endpoint) {
    return url.parse(endpoint, true).host;
  }

  /**
   * Configurates Event Grid Service Client
   *
   * @param {object[]} topics Event Grid Topics credentials
   *  @property {string} name Topic Name
   *  @property {string} endpoint Topic Endpoint
   *  @property {string} key Topic Secret Key
   * @param {object} commonProps Common Event Data Properties
   * @memberof EventGrid
   */
  config(topics, commonProps) {
    try {
      topics.forEach(topic => {
        this._clients[topic.name] = {
          client: this._createClient(topic.key),
          endpoint: this._getHost(topic.endpoint)
        };
      });
      if (commonProps) this._commonProps = commonProps;
    } catch (error) {
      throw new ServiceError(
        { name: ServiceError.types.EVENTGRID_CONFIG_ERROR, cause: error },
        "Failed to config Event Grid Client"
      );
    }
  }

  /**
   * Merges Event Data with Common Properties
   *
   * @param {object} event
   * @returns
   * @memberof EG
   */
  _mergeEventData(event) {
    return {
      ...event,
      ...this._baseEvent,
      data: { ...this._commonProps, ...event.data }
    };
  }

  /**
   * Publish event to Event Grid
   *
   * @param {string} eventType
   * @param {object} eventData
   * @memberof EG
   */
  async publish(eventType, eventData) {
    try {
      // Get Event Grid Topic name by Event Type
      const topic = EG._getTopicByEventType(eventType);
      // Merge Event Data with common properties
      const newEvent = this._mergeEventData(eventData);
      // Validate Event Data by Type Schema
      ServiceValidator.check(eventType, newEvent.data);

      await retry(
        async () => {
          // Get Event Grid Client for Topic
          const { client, host } = this._clients[topic];
          // Publish Event to Event Grid Topic
          await client.publishEvents(host, [newEvent]);
        },
        {
          retries: 3,
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
            eventType,
            eventData
          }
        },
        'Failed to publish "%s" event',
        eventType
      );
      Log.error(err);
      throw err;
    }
  }
}

const eventgrid = new EG();

export default eventgrid;
