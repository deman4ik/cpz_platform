import ServiceError from "../../error";

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
    const error = new ServiceError(
      { name: ServiceError.types.UNAUTHENTICATED },
      "Invalid API Key"
    );
    context.res = {
      status: 401,
      body: { error: error.json },
      headers: {
        "Content-Type": "application/json"
      }
    };
    return false;
  }
  return true;
};
