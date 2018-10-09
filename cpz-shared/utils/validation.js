import FValidator from "fastest-validator";
import VError from "verror";

const validator = new FValidator();

const createValidator = schema => validator.compile(schema);

const genErrorIfExist = validationErrors => {
  if (Array.isArray(validationErrors)) {
    throw new VError(
      {
        name: "ValidationError",
        info: {
          validationErrors
        }
      },
      `${validationErrors.map(err => err.message).join(" ")}`
    );
  }
};

export { createValidator, genErrorIfExist };
