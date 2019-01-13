import VError from "verror";

function createErrorOutput(error) {
  let err;
  if (error instanceof VError) {
    err = error;
  } else {
    err = new VError(
      { name: error.constructor.name, cause: error },
      error.message
    );
  }
  return {
    name: err.name,
    message: err.message,
    info: VError.info(err),
    cause: VError.cause(err),
    stack: VError.fullStack(err)
  };
}

export { createErrorOutput };
