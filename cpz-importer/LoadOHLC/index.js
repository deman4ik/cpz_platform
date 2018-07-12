const moment = require("moment");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
// Общий объект бирж для текущего инстанса
const exchanges = {};

async function LoadOHLC(context, input) {
  try {
    context.log("LoadOHLC");
    context.log(input);
    // Есть ли нужная биржа в общем объекте
    if (!Object.prototype.hasOwnProperty.call(exchanges, input.exchange)) {
      // Если нет добавляем
      let agent;
      if (input.proxy) {
        agent = new HttpsProxyAgent(input.proxy);
      }
      exchanges[input.exchange] = new ccxt[input.exchange]({
        // enableRateLimit: true,
        agent
      });
    }

    // Символ
    const symbol = `${input.baseq}/${input.quote}`;
    // Запрашиваем исторические свечи
    const candles = await exchanges[input.exchange].fetchOHLCV(
      symbol,
      input.timeframe,
      +moment(input.dateFrom)
    );
    // Если есть результат
    if (candles && candles.length > 0) {
      let next;
      // Последняя загруженная свеча
      const lastCandle = candles[candles.length - 1];
      // Дата начала импорта
      const startDate = input.startDate || input.dateFrom;
      // Дата последней загруженный свечи
      const lastDate = lastCandle[0];
      // Дата конца импорта
      const { dateTo } = input;
      // Всего минут
      const totalDuration =
        input.totalDuration ||
        moment.duration(moment(dateTo).diff(moment(startDate))).asMinutes();
      // Осталось минут
      let leftDuration = moment
        .duration(moment(dateTo).diff(lastDate))
        .asMinutes();
      // Не может быть меньше нуля
      leftDuration = leftDuration > 0 ? leftDuration : 0;
      // Загружено минут
      const completedDuration = totalDuration - leftDuration;
      // Процент выполнения
      let percent = (completedDuration / totalDuration) * 100;
      // Не может быть больше 100
      percent = percent <= 100 ? percent : 100;
      // Если дата конца импорта больше чем дата последней загруженной свечи
      if (moment(dateTo).isAfter(lastDate)) {
        // Формируем параметры нового запроса на импорт
        next = {
          ...input,
          timeout: exchanges[input.exchange].rateLimit + 10000,
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
      // Результат выполнения
      const result = {
        input, // старые параметры запроса
        next, // новые параметры запроса, если необходимо
        status, // текущий статус выполнения задачи
        data: candles // полученные данные
      };
      return result;
    }
  } catch (err) {
    context.log(err);
    throw err;
  }
  throw new Error("Error loading OHLC");
}

module.exports = LoadOHLC;
