import pretry from "p-retry";
import VError from "verror";

async function retry(
  name,
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
          name,
          retries: options.retries
        }
      },
      'Failed to execute function "%s" after "%d" attempts',
      name,
      options.retries
    );
  }
}

export default retry;
