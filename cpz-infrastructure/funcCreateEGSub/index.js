const Validator = require("fastest-validator");
const { getClient, createOrUpdateSub } = require("../eventGrid");

const v = new Validator();

const schema = {
  topicName: { type: "string" },
  subName: { type: "string" },
  baseUrl: { type: "url" },
  url: { type: "string" },
  types: { type: "array", items: "string", optional: true }
};
async function createSubscription(context, req) {
  const inputValidataionResult = v.validate(req.body, schema);
  if (inputValidataionResult === true) {
    try {
      const { topicName, subName, baseUrl, url, types } = req.body;
      const endpointUrl = baseUrl + url;
      const EGMClient = await getClient();

      const result = await createOrUpdateSub(
        EGMClient,
        topicName,
        subName,
        endpointUrl,
        types
      );

      context.res = {
        body: result
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
      body: inputValidataionResult
    };
  }
}

module.exports = createSubscription;
