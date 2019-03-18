import VError from "verror";
import Log from "cpz/log";
import { v4 as uuid } from "uuid";

/**
 * Check request authorization
 *
 *@function
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {Function} next - function processed req, res to the next middleware
 */
export default (req, res, next) => {
  Log.addContext({
    executionContext: {
      invocationId: uuid(),
      functionName: "taskEvents"
    }
  });
  if (req.query["api-key"] !== process.env.API_KEY) {
    Log.warn(new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key"));
    Log.request(req, res);
    Log.clearContext();
    res.status(401).end();
  } else {
    next();
  }
};
