import FValidator from "fastest-validator";
import VError from "verror";
import dayjs from "./lib/dayjs";

/**
 * Валидатор структуры объекта
 */
const validator = new FValidator({
  // расширение сообщения об ошибке для типа данных datetime
  messages: {
    datetime:
      "The '{field}' field must be an ISO 8601 date format! Actual: {actual}"
  }
});

// расширение валидатора новым типом данных datetime
validator.add("datetime", value => {
  if (!dayjs(value).isValid())
    return validator.makeError("datetime", null, value);

  return true;
});

/**
 * Создание валидатора по схеме
 *
 * @param {*} schema
 */
const createValidator = schema => validator.compile(schema);

/**
 * Выдача исключение при ошибках валидации
 *
 * @param {*} validationErrors
 */
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
