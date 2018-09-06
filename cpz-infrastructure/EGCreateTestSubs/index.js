const { getClient, createOrUpdateSub } = require("../eventGrid");
const servicesConfig = require("../config");

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
          const res = await Promise.all(
            item.egIn.map(async eg => {
              const endpointUrl = baseUrl + item.localUrlPrefix + eg.url;
              const result = await createOrUpdateSub(
                EGMClient,
                topicName,
                subName,
                endpointUrl,
                eg.types
              );
              return result;
            })
          );
          return res;
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
