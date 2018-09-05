const { getClient, createOrUpdateSub } = require("../eventGrid");
const servicesConfig = require("./config");

async function EGSub(context, req) {
  context.log("Manage subscription request.");

  if (req.body && req.body.topicName && req.body.baseUrl) {
    try {
      const { topicName, baseUrl, postfix } = req.body;
      const EGMClient = await getClient();

      const results = await Promise.all(
        Object.keys(servicesConfig).map(async key => {
          const item = servicesConfig[key];
          const subName = postfix ? `${item.name}-${postfix}` : item.name;
          const endpointUrl = baseUrl + item.url;
          const result = await createOrUpdateSub(
            EGMClient,
            topicName,
            subName,
            endpointUrl,
            item.types
          );
          return result;
        })
      );
      context.res = {
        body: results
      };
    } catch (err) {
      context.log(err);
      context.res = {
        status: 500,
        body: err
      };
    }
  } else {
    context.res = {
      status: 400,
      body: "Please pass a topic name and base url in the request body"
    };
  }
}

module.exports = EGSub;
