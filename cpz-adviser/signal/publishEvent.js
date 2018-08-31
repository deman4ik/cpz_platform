/*
 * Публикация свечей в топик EventGrid в различных таймфремах
 */
const uuid = require("uuid").v4;
const msRestAzure = require("ms-rest-azure");
const EventGrid = require("azure-eventgrid");
const url = require("url");

const TOPIC_KEY = process.env.EG_SIGNALS_TOPIC_KEY;
const TOPIC_END_POINT = process.env.EG_SIGNALS_TOPIC_ENDPOINT;

const topicCreds = new msRestAzure.TopicCredentials(TOPIC_KEY);
const egClient = new EventGrid(topicCreds);
const topicUrl = url.parse(TOPIC_END_POINT, true);
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
