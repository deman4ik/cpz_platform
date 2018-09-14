const pretry = require("p-retry");

async function retry(
  func,
  options = {
    retries: 2,
    minTimeout: 5000,
    maxTimeout: 10000
  }
) {
  try {
    const retryOptions = options;
    return await pretry(func, retryOptions);
  } catch (error) {
    return { isSuccess: false, error };
  }
}

module.exports = retry;
