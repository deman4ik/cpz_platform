import VError from "verror";

function createErrorOutput(error) {
  return {
    name: error.name,
    message: error.message,
    info: VError.info(error)
    // stack: VError.fullStack(error)
  };
}

export { createErrorOutput };
