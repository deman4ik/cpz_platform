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
      "The '{field}' field must be an ISO 8601 date format! Actual: {actual}",
    datediff: "The '{field}' field must be more or equal than field 'dateto'",
    requiredByField: "If have '{field}' the {expected} is required",
    keyNameError:
      "The '{field}' field must have another key. Actual: {actual}, expected: {expected}",
    exchange:
      "The '{field}' field must contain only letters, numbers or '_'. Actual: {actual}",
    currencyError:
      "The '{field}' field must be uppercase string. Actual: {actual}",
    NaN: "The '{field}' field must be a number",
    // Not an Integer
    NaI: "The '{field}' field must be an integer",
    posInt: "The '{field}' field must be positive"
  }
});

// расширение валидатора новым типом данных exchange
validator.add("exchange", value => {
  if (typeof value !== "string" || !/^[a-z0-9_]+$/.test(value))
    return validator.makeError("exchange ", null, value);

  return true;
});

// расширение валидатора новым типом данных currency
validator.add("currency", value => {
  if (typeof value !== "string" || !/^[A-Z]+$/.test(value))
    return validator.makeError("currencyError", null, value);

  return true;
});

// расширение валидатора новым типом данных int
validator.add("int", value => {
  /* eslint-disable no-restricted-globals */
  if (typeof value !== "number" || isNaN(value))
    return validator.makeError("NaN");
  if (value !== Math.floor(value)) return validator.makeError("NaI");

  return true;
});

validator.add("posInt", value => {
  /* eslint-disable no-restricted-globals */
  if (typeof value !== "number" || isNaN(value))
    return validator.makeError("NaN");
  if (value !== Math.floor(value)) return validator.makeError("NaI");
  if (value < 0) return validator.makeError("posInt", null, value);

  return true;
});

// расширение валидатора новым типом данных datetime
validator.add("datetime", value => {
  if (!dayjs.utc(value).isValid())
    return validator.makeError("datetime", null, value);

  return true;
});

const TYPE_DATE_FROM_KEY = "dateFrom";
const TYPE_DATE_TO_KEY = "dateTo";

// расширение валидатора новым типом данных datefrom
validator.add("datefrom", (value, _, key, parent) => {
  const dateFrom = dayjs.utc(value);

  const postfix = key.slice(TYPE_DATE_FROM_KEY.length);

  const SELF_KEY = TYPE_DATE_FROM_KEY + postfix;
  const DATE_TO_KEY = TYPE_DATE_TO_KEY + postfix;

  if (key !== SELF_KEY)
    return validator.makeError("keyNameError", SELF_KEY, key);

  if (!dateFrom.isValid()) return validator.makeError("datetime", null, value);

  if (!parent[DATE_TO_KEY]) validator.makeError("requiredByField", DATE_TO_KEY);

  const dateTo = dayjs.utc(parent[DATE_TO_KEY]);

  if (!dateTo.isValid()) return validator.makeError("datetime", null, value);

  if (dateTo.valueOf() <= dateFrom.valueOf())
    return validator.makeError("datediff", null, null);

  return true;
});

// расширение валидатора новым типом данных dateto
validator.add("dateto", (value, _, key, parent) => {
  const date = dayjs.utc(value);

  const postfix = key.slice(TYPE_DATE_TO_KEY.length);

  const SELF_KEY = TYPE_DATE_TO_KEY + postfix;
  const DATE_FROM_KEY = TYPE_DATE_FROM_KEY + postfix;

  if (key !== SELF_KEY)
    return validator.makeError("keyNameError", SELF_KEY, key);

  if (!date.isValid()) return validator.makeError("datetime", null, value);

  if (!parent[DATE_FROM_KEY])
    validator.makeError("requiredByField", DATE_FROM_KEY);

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
