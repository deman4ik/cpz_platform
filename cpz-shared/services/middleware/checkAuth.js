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
      body: { error: { message: "Invalid API Key" } },
      headers: {
        "Content-Type": "application/json"
      }
    };
    return false;
  }
  return true;
};
