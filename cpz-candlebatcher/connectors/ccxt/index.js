const dayjs = require("dayjs");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const { durationMinutes, completedPercent } = require("../utils");

// Общий объект бирж для текущего инстанса
const exchanges = {};

async function loadCandles(context, input) {
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
  if (input.exchange.toLowerCase() === "bitfinex" && input.currency === "USD") {
    symbol = `${input.asset}/USDT`;
  }
  context.log.info(symbol);
  // Запрашиваем исторические свечи
  const response = await exchanges[input.exchange].fetchOHLCV(
    symbol,
    timeframe,
    dayjs(input.nextDate).valueOf()
  );
  context.log.info(response);
  // Если есть результат
  if (response && response.length > 0) {
    context.log.info("Got ccxt response!");
    const data = response;
    // Исключаем последний элемент из массива с неполной свечей
    data.pop();

    // Последняя загруженная свеча
    const lastCandle = response[response.length - 1];
    // Если запрошена только 1 свеча
    if (input.limit === 1) {
      // Сразу отдаем последнюю свечу
      return {
        isSuccess: true,
        data: {
          time: lastCandle.time,
          open: lastCandle.open,
          close: lastCandle.close,
          high: lastCandle.high,
          low: lastCandle.low,
          volume: lastCandle.volume
        }
      };
    }

    // Дата начала импорта
    const startDate = dayjs(input.startDate) || dayjs(input.dateFrom);
    // Дата последней загруженный свечи
    const lastDate = dayjs(lastCandle[0]);
    // Дата конца импорта
    const dateTo = dayjs(input.dateTo);
    // Всего минут
    const totalDuration =
      input.totalDuration || durationMinutes(startDate, dateTo);
    // Осталось минут
    const leftDuration = durationMinutes(lastDate, dateTo);
    // Загружено минут
    const completedDuration = totalDuration - leftDuration;
    // Процент выполнения
    const percent = completedPercent(completedDuration, totalDuration);
    let nextDate;
    // Если дата конца импорта больше чем дата последней загруженной свечи
    if (dateTo.isAfter(lastDate)) {
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
    context.log.info(result);
    return result;
  }

  throw response;
}

module.exports = loadCandles;
