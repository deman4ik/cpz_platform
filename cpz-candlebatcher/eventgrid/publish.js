/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
const msRestAzure = require("ms-rest-azure");
const EventGrid = require("azure-eventgrid");
const url = require("url");

function createClient(key) {
  return new EventGrid(new msRestAzure.TopicCredentials(key));
}

function getHost(endpoint) {
  return url.parse(endpoint, true).host;
}

const topics = {
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

async function publish(context, topic, events) {
  try {
    const { client, host } = topics[topic];
    await client.publishEvents(host, events);

    return { isSuccess: true };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, topic, events, error };
  }
}

module.exports = publish;
