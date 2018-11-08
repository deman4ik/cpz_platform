import FValidator from "fastest-validator";
import VError from "verror";
import dayjs from "./lib/dayjs";

const validator = new FValidator({
  messages: {
    datetime:
      "The '{field}' field must be an ISO 8601 date format! Actual: {actual}"
  }
});

validator.add("datetime", value => {
  if (!dayjs(value).isValid())
    return validator.makeError("datetime", null, value);

  return true;
});
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
