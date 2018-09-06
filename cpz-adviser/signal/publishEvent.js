/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
const msRestAzure = require("ms-rest-azure");
const EventGrid = require("azure-eventgrid");
const url = require("url");

const EG_TOPIC_ENDPOINT =
  process.env.EG_SIGNALS_ENDPOINT || process.env.EG_TEST_ENDPOINT;
const EG_TOPIC_KEY = process.env.EG_SIGNALS_KEY || process.env.EG_TEST_KEY;

const topicCreds = new msRestAzure.TopicCredentials(EG_TOPIC_KEY);
const egClient = new EventGrid(topicCreds);
const topicUrl = url.parse(EG_TOPIC_ENDPOINT, true);
const topicHostName = topicUrl.host;

async function publish(context, events) {
  try {
    const result = await egClient.publishEvents(topicHostName, events);
    context.log(result);
    return { isSuccessful: true };
  } catch (error) {
    context.log(error);
    return { isSuccessful: false, events, error };
  }
}

module.exports = publish;
