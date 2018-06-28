const df = require("durable-functions");
const moment = require("moment");
const ccxt = require("ccxt");
const Validator = require("fastest-validator");

/* Валидация входных параметров */
const v = new Validator();
const schema = {
  exchange: { type: "string", min: 3 },
  exchangeId: { type: "string", min: 1 },
  base: { type: "string", min: 3 },
  quote: { type: "string", min: 3 },
  timeframe: { type: "string" },
  dateFrom: { type: "string" },
  dateTo: { type: "string" }
};
const checkParams = v.compile(schema);

/**
 * Запуск задачи импорта
 *
 * @param {*} context
 */
function* StartImport(context) {
  /* Считывание входного параметра */
  const config = context.df.getInput();
  /* Проверка параметров */
  if (checkParams(config)) {
    context.log(
      `${context.df.currentUtcDateTime} Starting import on ${config.exchange}-${
        config.symbol
      }-${config.timeframe} from: ${config.dateFrom} to: ${config.dateTo}`
    );
    /* Текущая дата начала */
    let currentLoadDate = moment(config.dateFrom);
    /* Параметры вызова */
    const loadConfig = {
      exchange: config.exchange,
      symbol: `${config.base}/${config.quote}`,
      timeframe: config.timeframe
    };
    /* Считывание лимита обращений для конкретной биржи */
    const { rateLimit } = new ccxt[config.exchange]();
    while (!currentLoadDate.isSameOrAfter(config.dateTo)) {
      /* Дата начала загрузки */
      loadConfig.since = currentLoadDate;
      /* Установка таймаута */
      const timeout = moment
        .utc(context.df.currentUtcDateTime)
        .add(rateLimit, "ms");
      context.log(timeout.format());
      /* Таймаут */
      yield context.df.createTimer(timeout.toDate());

      /* Вызов функции загрузки свечек с биржи */
      try {
        const result = yield context.df.callActivityAsync(
          "LoadOHLC",
          JSON.stringify(loadConfig)
        );
        currentLoadDate = moment(result[result.length - 1][0]);

        context.log(result);
      } catch (err) {
        context.log(err);
        return err;
      }
    }
  }

  throw new Error("Wrong import config.");
}

module.exports = df(StartImport);
