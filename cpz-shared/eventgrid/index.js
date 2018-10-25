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

const topicsConfig = {
  tasks: {
    client: createClient(process.env.EG_TASKS_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_TASKS_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  },
  ticks: {
    client: createClient(process.env.EG_CANDLES_KEY || process.env.EG_TEST_KEY),
    host: getHost(
      process.env.EG_CANDLES_ENDPOINT || process.env.EG_TEST_ENDPOINT
    )
  },
  candles: {
    client: createClient(process.env.EG_CANDLES_KEY || process.env.EG_TEST_KEY),
    host: getHost(
      process.env.EG_CANDLES_ENDPOINT || process.env.EG_TEST_ENDPOINT
    )
  },
  signals: {
    client: createClient(process.env.EG_SIGNALS_KEY || process.env.EG_TEST_KEY),
    host: getHost(
      process.env.EG_SIGNALS_ENDPOINT || process.env.EG_TEST_ENDPOINT
    )
  },
  trades: {
    client: createClient(process.env.EG_TRADES_KEY || process.env.EG_TEST_KEY),
    host: getHost(
      process.env.EG_TRADES_ENDPOINT || process.env.EG_TEST_ENDPOINT
    )
  },
  log: {
    client: createClient(process.env.EG_LOG_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_LOG_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  },
  error: {
    client: createClient(process.env.EG_LOG_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_LOG_ENDPOINT || process.env.EG_TEST_ENDPOINT)
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
      // TODO: validate event data
      const newEvent = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: eventData.subject,
        eventType: eventType.eventType,
        data
      };
      events.push(newEvent);
    }
    const { client, host } = topicsConfig[topic];
    await client.publishEvents(host, events);
    /*await retry(
      async () => {
        await client.publishEvents(host, events);
      },
      {
        retries: 2,
        minTimeout: 200,
        maxTimeout: 1000
      }
    ); */
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
    console.error(errorOutput.message, errorOutput);
    throw err;
  }
}

export default publishEvents;
