import VError from "verror";
import Log from "../../log";

/**
 * Check request is authorized
 * If request are not authorized call context.done() with status 401
 *
 * @function
 * @param {Object} context - context of Azure Functions
 * @param {Object} req - HTTP request
 * @return {Promise} Authorized request
 * */

export default (context, req) => {
  return new Promise(resolve => {
    if (req.query["api-key"] !== process.env.API_KEY) {
      context.res = {
        status: 401,
        body: "Invalid API Key",
        headers: {
          "Content-Type": "application/json"
        }
      };
      Log.warn(new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key"));
      context.done();
    } else {
      resolve(req);
    }
  });
};
