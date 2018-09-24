const Validator = require("fastest-validator");
const { getClient, listSubs } = require("../eventGrid");

const v = new Validator();

const schema = {
  topicName: { type: "string" }
};
async function listSubscriptions(context, req) {
  const inputValidataionResult = v.validate(req.body, schema);
  if (inputValidataionResult === true) {
    try {
      const { topicName } = req.body;
      const EGMClient = await getClient();

      const result = await listSubs(EGMClient, topicName);

      context.res = {
        body: result
      };
    } catch (err) {
      context.log.error(err);
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

module.exports = listSubscriptions;
