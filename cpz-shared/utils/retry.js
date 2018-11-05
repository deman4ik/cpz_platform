import pretry from "p-retry";
import VError from "verror";

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
    return new VError(
      {
        name: "RetryError",
        cause: error,
        info: {
          retries: options.retries
        }
      },
      'Failed to execute function after "%s" attempts',

      options.retries
    );
  }
}

export default retry;
