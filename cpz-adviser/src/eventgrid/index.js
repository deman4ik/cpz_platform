/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
import msRestAzure from "ms-rest-azure";
import EventGrid from "azure-eventgrid";
import url from "url";
import { v4 as uuid } from "uuid";
import { ADVISER_SERVICE } from "cpzServices";

function createClient(key) {
  return new EventGrid(new msRestAzure.TopicCredentials(key));
}

function getHost(endpoint) {
  return url.parse(endpoint, true).host;
}

const topics = {
  tasks: {
    client: createClient(process.env.EG_TASKS_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_TASKS_ENDPOINT || process.env.EG_TEST_ENDPOINT)
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
  log: {
    client: createClient(process.env.EG_LOG_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_LOG_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  }
};

function createEvents(eventData) {
  const events = [];
  const data = { service: ADVISER_SERVICE, ...eventData.data };
  const newEvent = {
    id: uuid(),
    dataVersion: "1.0",
    eventTime: new Date(),
    subject: eventData.subject,
    eventType: eventData.eventType,
    data
  };
  events.push(newEvent);
  return events;
}

async function publishEvents(context, topic, events) {
  try {
    const { client, host } = topics[topic];
    await client.publishEvents(host, events);

    return { isSuccess: true };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, topic, events, error };
  }
}

export { publishEvents, createEvents };
