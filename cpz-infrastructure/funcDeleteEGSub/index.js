const Validator = require("fastest-validator");
const { getClient, deleteSub } = require("../eventGrid");

const v = new Validator();

const schema = {
  topicName: { type: "string" },
  subName: { type: "string" }
};
async function deleteSubscription(context, req) {
  const inputValidataionResult = v.validate(req.body, schema);
  if (inputValidataionResult === true) {
    try {
      const { topicName, subName } = req.body;
      const EGMClient = await getClient();

      const result = await deleteSub(EGMClient, topicName, subName);

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

module.exports = deleteSubscription;
