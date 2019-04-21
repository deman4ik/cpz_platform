import ServiceError from "../../error";
import Log from "../../log";

/**
 * Check request is authorized
 * If request are not authorized call   with status 401
 *
 * @function
 * @param {Object} context - context of Azure Functions
 * @param {Object} req - HTTP request
 * */

export default (context, req) => {
  if (req.query["api-key"] !== process.env.API_KEY) {
    context.res = {
      status: 401,
      body: "Invalid API Key",
      headers: {
        "Content-Type": "application/json"
      }
    };
    Log.warn(
      new ServiceError(
        { name: ServiceError.types.UNAUTHENTICATED },
        "Invalid API Key"
      )
    );
    Log.request(context.req, context.res);
    Log.clearContext();
  }
};
