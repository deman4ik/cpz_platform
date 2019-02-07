/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
import msRestAzure from "ms-rest-azure";
import EventGrid from "azure-eventgrid";
import url from "url";
import { v4 as uuid } from "uuid";
import VError from "verror";
import { createErrorOutput } from "../utils/error";
import retry from "../utils/retry";

function createClient(key) {
  return new EventGrid(new msRestAzure.TopicCredentials(key));
}

function getHost(endpoint) {
  return url.parse(endpoint, true).host;
}
// TODO: Refactoring
const topicsConfig = {
  tasks: {
    client: process.env.EG_TASKS_KEY && createClient(process.env.EG_TASKS_KEY),
    host:
      process.env.EG_TASKS_ENDPOINT && getHost(process.env.EG_TASKS_ENDPOINT)
  },
  ticks: {
    client: process.env.EG_TICKS_KEY && createClient(process.env.EG_TICKS_KEY),
    host:
      process.env.EG_TICKS_ENDPOINT && getHost(process.env.EG_TICKS_ENDPOINT)
  },
  candles: {
    client:
      process.env.EG_CANDLES_KEY && createClient(process.env.EG_CANDLES_KEY),
    host:
      process.env.EG_CANDLES_ENDPOINT &&
      getHost(process.env.EG_CANDLES_ENDPOINT)
  },
  signals: {
    client:
      process.env.EG_SIGNALS_KEY && createClient(process.env.EG_SIGNALS_KEY),
    host:
      process.env.EG_SIGNALS_ENDPOINT &&
      getHost(process.env.EG_SIGNALS_ENDPOINT)
  },
  trades: {
    client:
      process.env.EG_TRADES_KEY && createClient(process.env.EG_TRADES_KEY),
    host:
      process.env.EG_TRADES_ENDPOINT && getHost(process.env.EG_TRADES_ENDPOINT)
  },
  log: {
    client: process.env.EG_LOG_KEY && createClient(process.env.EG_LOG_KEY),
    host: process.env.EG_LOG_ENDPOINT && getHost(process.env.EG_LOG_ENDPOINT)
  },
  error: {
    client: process.env.EG_LOG_KEY && createClient(process.env.EG_LOG_KEY),
    host: process.env.EG_LOG_ENDPOINT && getHost(process.env.EG_LOG_ENDPOINT)
  }
};

async function publishEvents(topic, eventData) {
  try {
    let events = [];
    if (Array.isArray(eventData)) {
      events = eventData;
    } else {
      const { eventType } = eventData;
      const data = { service: eventData.service, ...eventData.data };
      const newEvent = {
        id: uuid(),
        metadataVersion: "1",
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: eventData.subject,
        eventType: eventType.eventType,
        data
      };
      events.push(newEvent);
    }

    await retry(
      async () => {
        const { client, host } = topicsConfig[topic];
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

export default publishEvents;
