import VError from "verror";
import * as errorTypes from "./errorTypes";

const { stringify: str } = JSON;
// For saving time - one time
const errorTypesList = Object.values(errorTypes);
const { UNKNOWN_ERROR: UN } = errorTypes;

class ServiceError extends VError {
  /**
   * Создаем одинаковые ошибки
   *
   * @param {object} body VError body. Check docs https://github.com/joyent/node-verror
   *  @property {string} name название ошибки. Константы доставать из cpzTypes/state/errorTypes
   *  @property {Error | VError} cause предыдущая ошибка (уровень выше)
   *  @property {object} info информация для пользователя (достать и обработать с помощью VError.info(error))
   *  @property {boolean} $$toCheck флаг - проверять ли error.name
   *  @property {string} $$defaultFormatPattern дефолтный паттерн для метода .format(pattern = this.$$defaultFormatPattern)
   * @param  {...any} args сообщение в print-f стиле
   */
  constructor(body = {}, ...args) {
    super(body, ...args);
    const {
      name = UN,
      cause,
      info = {},
      $$toCheck = true,
      $$defaultFormatPattern = "{name}: {message}\ninfo: {info}\nstack: {stack}"
    } = body;

    this.$$defaultFormatPattern = $$defaultFormatPattern;

    if ($$toCheck && !errorTypesList.includes(name)) {
      this.name = UN;
      this.jse_cause = new ServiceError(
        {
          name,
          cause,
          info,
          $$toCheck: false
        },
        ...args
      );
    }
  }

  static get types() {
    return errorTypes;
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

  get json() {
    return {
      name: this.name,
      message: this.jse_shortmsg,
      info: this.info,
      stack: ServiceError.getStack(this)
    };
  }

  get main() {
    return {
      name: this.name,
      message: this.jse_shortmsg
    };
  }

  /**
   * @param {Boolean} fullStack формировать полный стэк вызова
   * @returns {string} отформатированная в строка ошибки (аналог toString)
   */
  toString(fullStack) {
    const formatStr = fullStack
      ? ServiceError.$$fullStackFormatPattern
      : ServiceError.$$defaultFormatPattern;
    return this.format(formatStr);
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
      .replace(/{message}/g, error.jse_shortmsg || "not enought message")
      .replace(
        /{stack}/g,
        ServiceError.getStackNames(error) || "not enought stack"
      )
      .replace(/{fullStack}/g, VError.fullStack(error) || "not enought stack")
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
   * @param {Error | VError | ServiceError} error VError | Error insted
   * @returns {string[]} возвращает стек ошибок по названию (от начала до корня)
   */
  static getStackNames(error) {
    return ServiceError.getStack(error)
      .map(err => `${err.name}: ${err.message}`)
      .join("\n");
  }

  /**
   * @param {Error | VError | ServiceError} error VError | Error insted
   * @returns {Array} возвращает стек ошибок (от корня до начала) в виде массива объектов
   */
  static getStack(error) {
    const stack = [];
    let curErr = error;
    while (curErr) {
      stack.push({
        name: curErr.name,
        message: curErr.jse_shortmsg || curErr.message
      });
      if (curErr) curErr = curErr.cause ? curErr.cause() : false;
    }

    return stack;
  }
}

ServiceError.$$defaultFormatPattern =
  "{name}: {message}\ninfo: {info}\nstack: {stack}";

ServiceError.$$fullStackFormatPattern =
  "{name}: {message}\ninfo: {info}\nstack: {stack}\nfullStack: {fullStack}";

export default ServiceError;
