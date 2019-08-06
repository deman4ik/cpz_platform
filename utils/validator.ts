import Validator, { ValidationSchema } from "fastest-validator";
import { Errors } from "moleculer";

const v = new Validator();

function validate(data: object, schema: ValidationSchema): void {
  const validationErrors = v.validate(data, schema);
  if (Array.isArray(validationErrors)) {
    throw new Errors.MoleculerError(
      `${validationErrors.map(err => err.message).join(" ")}`
    );
  }
}

export { validate };
