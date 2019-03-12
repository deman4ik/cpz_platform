import ServiceError from "../error";
import validator from "./validator";

class ServiceValidator {
  constructor() {
    this._validators = {};
  }

  add(schemas) {
    Object.keys(schemas).forEach(key => {
      this._validators[key] = validator.compile(schemas[key]);
    });
  }

  check(schemaName, data) {
    if (!Object.prototype.hasOwnProperty.call(this._validators, schemaName))
      throw new Error(`Validation schema "${schemaName}" doesn't exist`);
    const validationErrors = this._validators[schemaName](data);
    if (Array.isArray(validationErrors)) {
      throw new ServiceError(
        {
          name: ServiceError.types.VALIDATION_ERROR,
          info: {
            validationErrors
          }
        },
        `${validationErrors.map(err => err.message).join(" ")}`
      );
    }
  }
}
const serviceValidator = new ServiceValidator();
export default serviceValidator;
