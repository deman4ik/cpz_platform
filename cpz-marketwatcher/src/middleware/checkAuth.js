import ServiceError from "cpz/error";
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
    const error = new ServiceError(
      { name: ServiceError.types.UNAUTHENTICATED },
      "Invalid API Key"
    );
    Log.warn(error.json);
    Log.clearContext();
    res.status(401).json({ error: error.json });
  } else {
    next();
  }
};
