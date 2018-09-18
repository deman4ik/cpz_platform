const dayjs = require("dayjs");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const { durationMinutes, completedPercent } = require("../utils");

// Общий объект бирж для текущего инстанса
const exchanges = {};

/* 
 * Загрзука свечей с помощью CCXT
 * Прямой порядок загрузки сначала старые потом свежие */
async function loadCandles(context, input) {
  try {
    context.log.info(`loadCandles CCXT input:`, input);
    // Есть ли нужная биржа в общем объекте
    if (!Object.prototype.hasOwnProperty.call(exchanges, input.exchange)) {
      // Если нет добавляем
      const agent = new HttpsProxyAgent(
        input.proxy || process.env.PROXY_ENDPOINT
      );

      exchanges[input.exchange] = new ccxt[input.exchange]({
        agent
      });
    }
    const timeframe = `${input.timeframe}m`;
    // Символ
    let symbol = `${input.asset}/${input.currency}`;
    // ? Пока костыль
    let exchangeName = input.exchange.toLowerCase();
    if (exchangeName === "bitfinex") {
      exchangeName = "bitfinex2";
      if (input.currency === "USD") {
        symbol = `${input.asset}/USDT`;
      }
    }
    // Дата начала загрузки свечек
    const start = input.nextDate || input.dateFrom;
    // Если загружаем только одну свечу, то дата начала 2 минуты назад
    const importStart =
      input.limit === 1 ? dayjs().add(-2, "minute") : dayjs(start);

    // Запрашиваем исторические свечи
    const response = await exchanges[input.exchange].fetchOHLCV(
      symbol,
      timeframe,
      importStart.valueOf(),
      input.limit || 500
    );
    // Если есть результат
    if (response && response.length > 0) {
      context.log.info("Got ccxt response!");
      // Первая загруженная свеча
      const firstCandle = response[0];
      // Если запрошена только 1 свеча
      if (input.limit === 1) {
        // Сразу отдаем последнюю свечу
        return {
          isSuccess: true,
          data: {
            time: firstCandle[0],
            open: firstCandle[1],
            high: firstCandle[2],
            low: firstCandle[3],
            close: firstCandle[4],
            volume: firstCandle[5]
          }
        };
      }
      // Дата начала импорта
      const dateStart = dayjs(input.dateFrom);
      // Дата конца импорта
      const dateEnd = dayjs(input.dateTo);
      // Отбрасываем лишнее
      const data = response.filter(
        candle =>
          dayjs(candle[0]).isAfter(dateStart) ||
          dayjs(candle[0]).isBefore(dateEnd)
      );

      context.log.info(data);
      // Последняя загруженная свеча
      const lastCandle = data[data.length - 1];
      // Дата последней загруженный свечи
      const lastDate = dayjs(lastCandle[0]);
      // Всего минут
      const totalDuration =
        input.totalDuration || durationMinutes(dateStart, dateEnd);
      // Осталось минут
      const leftDuration = durationMinutes(lastDate, dateEnd, true);
      // Загружено минут
      const completedDuration = totalDuration - leftDuration;
      // Процент выполнения
      const percent = completedPercent(completedDuration, totalDuration);
      let nextDate;
      // Если дата конца импорта больше чем дата последней загруженной свечи
      if (dateEnd.isAfter(lastDate)) {
        // Формируем параметры нового запроса на импорт
        nextDate = lastDate.toJSON();
      }

      // Результат выполнения
      const result = {
        isSuccess: true,
        nextDate,
        totalDuration,
        completedDuration,
        leftDuration,
        percent,
        data // полученные данные
      };
      return result;
    }
  } catch (error) {
    context.log.error(error);
    throw error;
  }
  return { isSuccess: false };
}

module.exports = loadCandles;
