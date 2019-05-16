import ServiceError from "../error";
import validator from "./validator";

/**
 * Validator
 * @class
 * Validate data by schema
 */
class ServiceValidator {
  constructor() {
    this._validators = {};
  }

  /**
   * Add new schema
   * @method
   * @param {Object} schema - schema
   * */
  add(schemas) {
    Object.keys(schemas).forEach(key => {
      try {
        this._validators[key] = validator.compile(schemas[key]);
      } catch (e) {
        console.error(key, e);
        throw e;
      }
    });
  }

  /**
   * Check data by schema name
   * @method
   * @param {Object} schemaName - needed schema
   * @param {Object} data - data to validate
   * */
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

  /**
   * Check data by schema
   * @method
   * @param {Object} schema - needed schema
   * @param {Object} data - data to validate
   * */
  simpleCheck(schema, data) {
    const validationErrors = validator.validate(data, schema);
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
