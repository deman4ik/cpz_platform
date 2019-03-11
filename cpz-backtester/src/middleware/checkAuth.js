import VError from "verror";
import Log from "cpzLog";

/**
 * Check request authorization
 *
 *@function
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {Function} next - function processed req, res to the next middleware
 */
export default (req, res, next) => {
  if (req.query["api-key"] !== process.env.API_KEY) {
    Log.warn(new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key"));
    res.status(401).end();
  } else {
    next();
  }
};
