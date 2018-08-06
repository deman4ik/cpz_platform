const uuid = require('uuid').v4;
const msRestAzure = require('ms-rest-azure');
const eventGrid = require("azure-eventgrid");
const url = require('url');

const TOPIC_KEY = process.env.EG_TOPIC_KEY;
const TOPIC_END_POINT = process.env.EG_TOPIC_ENDPOINT;

let topicCreds = new msRestAzure.TopicCredentials(TOPIC_KEY);
    let egClient = new eventGrid(topicCreds);
    let topicUrl = url.parse(TOPIC_END_POINT, true);
    let topicHostName = topicUrl.host;

const publish = async () => {
    try{
    let currentDate = new Date();

    let events = [
        {
          id: uuid(),
          subject: 'CPZ.Tick',
          dataVersion: '1.0',
          eventType: 'CPZ.Ticks.TickReceivedEvent',
          data: {
            price : 10500
          },
          eventTime: currentDate
        }
      ];

     const result = await egClient.publishEvents(topicHostName, events);
     console.log(result);
     return result;
    }
    catch(err)
    {
        console.log(err);
    }
}

module.exports = publish;