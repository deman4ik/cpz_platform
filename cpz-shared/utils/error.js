import VError from "verror";
import * as errorTypes from "../config/events/types/state/errorTypes/index";

const { stringify: str } = JSON;

/**
 * Генерация объекта с ошибкой
 *
 * @param {*} error стандартный экземпляр Error или экземпляр VError
 */
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

// For saving time - one time
const errorTypesList = Object.values(errorTypes);
const { UNKNOWN_ERROR: UN } = errorTypes;

class ServiceError extends VError {
  /**
   * Создаем одинаковые ошибки
   *
   * @param {object} body VError body. Check docs https://github.com/joyent/node-verror
   *  @property {string} name название ошибки. Константы доставать из cpzTypes/state/errorTypes
   *  @property {string} message информация для разработчика
   *  @property {Error | VError} cause предыдущая ошибка (уровень выше)
   *  @property {object} info информация для пользователя (достать и обработать с помощью VError.info(error))
   *  @property {boolean} $$toCheck флаг - проверять ли error.name
   *  @property {string} $$defaultFormatPattern дефолтный паттерн для метода .format(pattern = this.$$defaultFormatPattern)
   * @param  {...any} args последующие аргументы для VError
   */
  constructor(body = {}, ...args) {
    super(body, ...args);
    const {
      name = UN,
      cause,
      info = {},
      message,
      $$toCheck = true,
      $$defaultFormatPattern = "{name}: {message}\ninfo: {info}\nstack: {stack}"
    } = body;

    this.$$defaultFormatPattern = $$defaultFormatPattern;

    if ($$toCheck && !errorTypesList.includes(name)) {
      this.name = UN;
      this.jse_cause = new ServiceError({
        name,
        cause,
        info,
        message,
        $$toCheck: false
      });
    }
  }

  /**
   * Получить полный стек ошибки
   *
   * @returns {any} глубокий стек ошибок
   */
  get fullStack() {
    return VError.fullStack(this);
  }

  get info() {
    return VError.info(this);
  }

  /**
   * @returns {string} отформатированная в строка ошибки (аналог toString)
   */
  toString() {
    return this.format();
  }

  /**
   * Привести к строке ошибку
   *
   * @param {Error | VError | ServiceError} error VError | Error insted
   * @returns {string} отформатированная в строка ошибки (аналог toString)
   */
  static formatError(error, formatStr = ServiceError.$$defaultFormatPattern) {
    if (!ServiceError.isModifiedError(error)) return error.toString();

    return formatStr
      .replace(/{name}/g, error.name || "not enought name")
      .replace(/{message}/g, error.message || "not enought message")
      .replace(/{stack}/g, VError.fullStack(error) || "not enought stack")
      .replace(/{info}/g, str(VError.info(error)) || "not enought info");
  }

  /**
   * Привести к строке ошибку
   *
   * @param {string} formatStr
   * @returns {string} отформатированная в строка ошибки (аналог toString)
   */
  format(formatStr = this.$$defaultFormatPattern) {
    return ServiceError.formatError(this, formatStr);
  }

  /**
   * Является ли ошибка VError || ServiceError
   *
   * @param {Error | VError | ServiceError} error VError | Error insted
   * @returns {boolean}
   */
  static isModifiedError(error) {
    return error instanceof VError || error instanceof ServiceError;
  }

  /**
   * @returns {string[]} возвращает стек ошибок по названию (от начала до корня)
   */
  getStackNames() {
    return ServiceError.getStackNamesError(this);
  }

  /**
   * @param {Error | VError | ServiceError} error VError | Error insted
   * @returns {string[]} возвращает стек ошибок по названию (от начала до корня)
   */
  static getStackNamesError(error) {
    const stack = [];
    let curErr = error;

    while (curErr) {
      stack.push(curErr.name);
      if (curErr) curErr = curErr.cause ? curErr.cause() : false;
    }

    return stack.reverse();
  }
}

ServiceError.$$defaultFormatPattern =
  "{name}: {message}\ninfo: {info}\nstack: {stack}";

export { createErrorOutput, ServiceError };
