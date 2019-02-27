import VError from "verror";
import * as appInsights from "applicationinsights";

/**
 * Логирование и сбор аналитики
 *
 * @class Log
 */
class Log {
  constructor() {
    this._logInfo = console.log;
    this._logWarn = console.warn;
    this._logError = console.error;
    this._serviceName = "platform";
    this._appInstightsEnabled = !!process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
    this.initAppInsights();
  }

  /**
   * Инициализация службы Applicatin Insights
   *
   * @memberof Log
   */
  initAppInsights() {
    if (this._appInstightsEnabled) {
      appInsights
        .setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true);
      appInsights.start();
    }
  }

  /**
   * Установка имени сервиса для службы аналитики
   *
   * @param {string} serviceName
   * @memberof Log
   */
  setService(serviceName) {
    this._serviceName = serviceName;
    if (this._appInstightsEnabled) {
      appInsights.defaultClient.context.tags[
        appInsights.defaultClient.context.keys.cloudRole
      ] = serviceName;
    }
  }

  /**
   * Установка текущего контекста запроса
   * для рантайма Azure Functions
   *
   * @param {Object} context
   * @param {function} context.log
   * @param {function} context.log.info
   * @param {function} context.log.warn
   * @param {function} context.log.error
   * @memberof Log
   */
  addContext({ log }) {
    if (!log || !log.info || !log.warn || !log.error)
      throw new VError(
        { name: "LogError" },
        "Failed to add context to Log Instance"
      );
    this._logInfo = log.info;
    this._logWarn = log.warn;
    this._logError = log.error;
  }

  /**
   * Логирование в консоль уровня info
   *
   * @param {*} args
   * @memberof Log
   */
  info(...args) {
    this._logInfo(`CPZ-${this._serviceName}`, ...args);
  }

  /**
   * Логирование в консоль уровня warn
   *
   * @param {*} args
   * @memberof Log
   */
  warn(...args) {
    this._logWarn(...args);
  }

  /**
   * Логирование в консоль уровня error
   *
   * @param {*} args
   * @memberof Log
   */
  error(...args) {
    this._logError(...args);
  }

  /**
   * Отправка события в службу аналитики
   *
   * @param {Object} eventData
   * @memberof Log
   */
  event(eventData, eventGrid = false) {
    if (this._appInstightsEnabled) {
      if (eventData) {
        // TODO: Parse base Event Types from config
        const name = eventData.name || "UnknownEvent"; // TODO: Create constant
        appInsights.defaultClient.trackEvent({ name, properties: eventData });
        if (eventGrid) {
          // TODO: Publish to Event Grid LOG Topic
        }
      }
    }
  }

  /**
   * Логирование критических ошибок и отправка в службу аналитики
   *
   * @param {*} errorData
   * @memberof Log
   */
  exception(errorData, eventGrid = false) {
    if (this._appInstightsEnabled) {
      if (errorData) {
        // TODO: Check errorData type - Error or VError
        const errorString = JSON.stringify(errorData); // TODO: Better VError stringify
        this._logError(errorString);
        appInsights.defaultClient.trackException({
          exception: errorData
        });
        if (eventGrid) {
          // TODO: Publish to  Event Grid Error Topic
        }
      }
    }
  }

  /**
   * Отправка метрики в службу аналитики
   *
   * @param {Object} metric
   * @param {string} metric.name
   * @param {string} metric.value
   * @memberof Log
   */
  metric({ name, value }) {
    if (this._appInstightsEnabled) {
      if (name && value) {
        appInsights.defaultClient.trackMetric({ name, value });
      }
    }
  }

  /**
   * Отправка информации о запросах к внешним сервисам в службу аналитики
   *
   * @param {Object} data
   * @memberof Log
   * @example data
   * {target:"http://dbname", name:"select customers proc", data:"SELECT * FROM Customers", duration:231, resultCode:0, success: true, dependencyTypeName: "ZSQL"}
   */
  dependency(data) {
    if (this._appInstightsEnabled) {
      if (data && data.target && data.name && data.data)
        appInsights.defaultClient.trackDependency(data);
    }
  }
}

const log = new Log();

export default log;
