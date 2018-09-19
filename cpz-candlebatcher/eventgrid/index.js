/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
const msRestAzure = require("ms-rest-azure");
const EventGrid = require("azure-eventgrid");
const url = require("url");
const uuid = require("uuid").v4;
const { CANDLEBATCHER_SERVICE } = require("../config");

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
  log: {
    client: createClient(process.env.EG_LOG_KEY || process.env.EG_TEST_KEY),
    host: getHost(process.env.EG_LOG_ENDPOINT || process.env.EG_TEST_ENDPOINT)
  }
};

function createEvents(eventData) {
  const events = [];
  const data = { service: CANDLEBATCHER_SERVICE, ...eventData.data };
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

module.exports = { publishEvents, createEvents };
