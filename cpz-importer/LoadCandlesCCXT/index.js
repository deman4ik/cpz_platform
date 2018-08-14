const moment = require("moment");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const { durationMinutes, completedPercent } = require("../utils");

// Общий объект бирж для текущего инстанса
const exchanges = {};

async function LoadCandlesCCXT(context, input) {
  try {
    context.log("LoadCandlesCCXT");
    context.log(input);
    // Есть ли нужная биржа в общем объекте
    if (!Object.prototype.hasOwnProperty.call(exchanges, input.exchange)) {
      // Если нет добавляем
      let agent;
      if (input.proxy) {
        agent = new HttpsProxyAgent(input.proxy);
      }
      exchanges[input.exchange] = new ccxt[input.exchange]({
        enableRateLimit: true,
        agent
      });
    }

    // Символ
    const symbol = `${input.baseq}/${input.quote}`;
    // Запрашиваем исторические свечи
    const response = await exchanges[input.exchange].fetchOHLCV(
      symbol,
      input.timeframe,
      +moment(input.dateFrom)
    );
    // Если есть результат
    if (response && response.length > 0) {
      let next;
      // Последняя загруженная свеча
      const lastCandle = response[response.length - 1];
      // Дата начала импорта
      const startDate = input.startDate || input.dateFrom;
      // Дата последней загруженный свечи
      const lastDate = lastCandle[0];
      // Дата конца импорта
      const { dateTo } = input;
      // Всего минут
      const totalDuration =
        input.totalDuration || durationMinutes(startDate, dateTo);
      // Осталось минут
      const leftDuration = durationMinutes(lastDate, dateTo);
      // Загружено минут
      const completedDuration = totalDuration - leftDuration;
      // Процент выполнения
      const percent = completedPercent(completedDuration, totalDuration);

      // Если дата конца импорта больше чем дата последней загруженной свечи
      if (moment(dateTo).isAfter(lastDate)) {
        // Формируем параметры нового запроса на импорт
        next = {
          ...input,
          timeout: exchanges[input.exchange].rateLimit,
          startDate,
          completedDuration,
          totalDuration,
          dateFrom: moment(lastDate)
            .utc()
            .format()
        };
      }
      // Текущий статус импорта
      const status = {
        totalDuration,
        completedDuration,
        leftDuration,
        percent
      };
      /* TODO: time в unix */
      // Результат выполнения
      const result = {
        input, // старые параметры запроса
        next, // новые параметры запроса, если необходимо
        status, // текущий статус выполнения задачи
        data: response // полученные данные
      };
      return result;
    }
  } catch (err) {
    context.log(err);
    throw err;
  }
  throw new Error("Error loading OHLC");
}

module.exports = LoadCandlesCCXT;
