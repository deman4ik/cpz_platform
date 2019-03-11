import util from "util";
import VError from "verror";
import * as appInsights from "applicationinsights";

const SEVERITY_LEVEL = appInsights.Contracts.SeverityLevel;
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
    this._executionContext = {
      ServiceName: "platform"
    };
    this._appInstightsKey = null;
  }

  /**
   * Инициализация службы Applicatin Insights
   * @param {Object} input
   *  @property {string} key
   *  @property {string} serviceName
   * @memberof Log
   */
  config({ key, serviceName }) {
    this._appInstightsKey = key;
    if (this._appInstightsKey) {
      appInsights
        .setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true);

      appInsights.start();
      if (serviceName) {
        appInsights.defaultClient.context.tags[
          appInsights.defaultClient.context.keys.cloudRole
        ] = serviceName;

        this._executionContext.ServiceName = serviceName;
      }
      appInsights.defaultClient.commonProperties = {
        ...this._executionContext
      };
    }
  }

  _updateAppInsightsCommonProperties() {
    if (this._appInstightsKey) {
      appInsights.defaultClient.commonProperties = {
        ...this._executionContext
      };
    }
  }

  /**
   * Установка текущего контекста запроса
   * для рантайма Azure Functions
   *
   * @param {Object} context
   *  @property {function} log
   *   @property {function} log.info
   *   @property {function} log.warn
   *   @property {function} log.error
   *  @property {Object} executionContext
   *   @property {string} invocationId
   *   @property {string} functionName
   * @memberof Log
   */
  addContext(context) {
    if (!context)
      throw new VError(
        { name: "LogError" },
        "Failed to add context to Log Instance"
      );
    const { log, executionContext } = context;
    if (log) {
      this._logInfo = log.info;
      this._logWarn = log.warn;
      this._logError = log.error;
    }
    this._executionContext.InvocationId = executionContext.invocationId;
    this._executionContext.FunctionName = executionContext.functionName;

    this._updateAppInsightsCommonProperties();
  }

  clearContext() {
    this._logInfo = console.log;
    this._logWarn = console.warn;
    this._logError = console.error;
    delete this._executionContext.InvocationId;
    delete this._executionContext.FunctionName;
    this._updateAppInsightsCommonProperties();
  }

  /**
   * Create string message to log
   * supports print-f format
   *
   * @param {*} args
   * @returns
   * @memberof Log
   */
  _createMessage(args) {
    return `cpz-${this._executionContext.ServiceName} ${util.format(...args)}`;
  }

  /**
   * Логирование только в консоль
   *
   * @param {*} args
   * @memberof Log
   */
  console(...args) {
    this._logInfo(this._createMessage(args));
  }

  /**
   * Базовое логирование
   *
   * @param {SeverityLevel} severity
   * @param {Object} props
   * @param {*} msgs
   * @memberof Log
   */
  _log(severity, props, msgs) {
    let properties = props;
    let messages = msgs;
    if (typeof props !== "object") {
      properties = null;
      if (typeof props === "string") messages = [props, ...msgs];
    }
    const message = this._createMessage(messages);
    switch (severity) {
      case SEVERITY_LEVEL.Verbose:
      case SEVERITY_LEVEL.Information:
        this._logInfo(message);
        break;
      case SEVERITY_LEVEL.Warning:
        this._logWarn(message);
        break;
      case SEVERITY_LEVEL.Error:
      case SEVERITY_LEVEL.Critical:
        this._logError(message);
        break;
      default:
        this._logInfo(message);
    }
    this._logInfo(message);
    if (this._appInstightsKey)
      appInsights.defaultClient.trackTrace({
        message,
        severity,
        properties
      });
  }

  /**
   * Логирование уровня verbose
   *
   * @param {Object | String} props
   * @param {*} args
   * @memberof Log
   */
  debug(props, ...args) {
    this._log(SEVERITY_LEVEL.Verbose, props, args);
  }

  /**
   * Логирование уровня info
   *
   * @param {Object | String} props
   * @param {*} args
   * @memberof Log
   */
  info(props, ...args) {
    this._log(SEVERITY_LEVEL.Information, props, args);
  }

  /**
   * Логирование уровня warn
   *
   * @param {Object | String} props
   * @param {*} args
   * @memberof Log
   */
  warn(props, ...args) {
    this._log(SEVERITY_LEVEL.Warning, props, args);
  }

  /**
   * Логирование уровня error
   *
   * @param {Object | String} props
   * @param {*} args
   * @memberof Log
   */
  error(props, ...args) {
    this._log(SEVERITY_LEVEL.Error, props, args);
  }

  /**
   * Логирование уровня critical
   *
   * @param {Object | String} props
   * @param {*} args
   * @memberof Log
   */
  critical(props, ...args) {
    this._log(SEVERITY_LEVEL.Critical, props, args);
  }

  /**
   * Отправка события в службу аналитики
   *
   * @param {Object} eventData
   * @memberof Log
   */
  event(eventData) {
    this._logInfo(JSON.stringify(eventData));
    if (this._appInstightsKey) {
      if (eventData) {
        // TODO: Parse base Event Types from config
        const name = eventData.name || "UnknownEvent"; // TODO: Create constant
        appInsights.defaultClient.trackEvent({
          name,
          properties: eventData
        });
      }
    }
  }

  /**
   * Логирование критических ошибок и отправка в службу аналитики
   *
   * @param {*} errorData
   * @memberof Log
   */
  exception(errorData) {
    if (this._appInstightsKey) {
      if (errorData) {
        // TODO: Check errorData type - Error or VError
        const errorString = JSON.stringify(errorData); // TODO: Better VError stringify
        this._logError(errorString);
        appInsights.defaultClient.trackException({
          exception: errorData
        });
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
    if (this._appInstightsKey) {
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
    if (this._appInstightsKey) {
      if (data && data.target && data.name && data.data)
        appInsights.defaultClient.trackDependency(data);
    }
  }

  /**
   *  Отправка информации о входящих HTTP запросах
   *
   * @param {*} request
   * @param {*} response
   * @memberof Log
   */
  request(request, response) {
    appInsights.defaultClient.trackNodeHttpRequest({
      request,
      response
    });
  }
}

const log = new Log();

export default log;
