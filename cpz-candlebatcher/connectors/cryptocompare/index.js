const dayjs = require("dayjs");
const fetch = require("node-fetch");
const HttpsProxyAgent = require("https-proxy-agent");
const { histoDay, histoHour, histoMinute } = require("./cryptocompare");
const { durationMinutes, completedPercent } = require("../utils");

function fetchJSON(url, agent) {
  return fetch(url, { agent })
    .then(res => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(body => {
      if (body.Response === "Error") throw body.Message;
      return body;
    });
}
/* 
 * Загрзука свечей из CryptoCompare
 * Обратный порядок загрузки сначала свежие потом старые */
async function loadCandles(context, input) {
  context.log.info("Load Candles CryptoCompare");
  context.log.info(input);

  const agent = new HttpsProxyAgent(input.proxy || process.env.PROXY_ENDPOINT);

  const options = {
    fsym: input.asset,
    tsym: input.currency,
    exchange: input.exchange,
    limit: input.limit || 500
  };
  if (input.limit !== 1) {
    options.timestamp = dayjs(input.nextDate || input.dateTo).unix();
  }
  let url;
  // Запрашиваем свечи
  switch (input.timeframe) {
    case 1:
      url = histoMinute(options);
      break;
    case 60:
      url = histoHour(options);
      break;
    case 3600:
      url = histoDay(options);
      break;
    default:
      throw new Error("Unknown timeframe. Must be: '1', '60', '3600'.");
  }
  const response = await fetchJSON(url, agent);
  // Если ошибка генерируем исключение
  if (response.Response === "Error") throw new Error(response.Message);
  // Если успешно и есть данные
  if (response.Response === "Success" && response.Data.length > 0) {
    // Если запрошена только 1 свеча
    if (input.limit === 1) {
      // Сразу отдаем последнюю свечу
      const latestCandle = response.Data[0];
      return {
        isSuccess: true,
        data: {
          time: latestCandle.time * 1000,
          open: latestCandle.open,
          close: latestCandle.close,
          high: latestCandle.high,
          low: latestCandle.low,
          volume: latestCandle.volumefrom
        }
      };
    }
    // Дата начала импорта
    const dateStart = dayjs(input.dateFrom);
    // Дата конца импорта
    const dateEnd = dayjs(input.dateTo);
    const filteredData = response.Data.filter(
      candle =>
        dayjs(candle.time * 1000).isAfter(dateStart) ||
        dayjs(candle.time * 1000).isBefore(dateEnd)
    );
    /* Преобразуем объект в массив */
    const data = filteredData.map(item => [
      item.time * 1000,
      item.open,
      item.high,
      item.low,
      item.close,
      item.volumefrom
    ]);
    // Дата первой загруженный свечи
    const currentStart = dayjs(data[0][0]);

    // Всего минут
    const totalDuration =
      input.totalDuration || durationMinutes(dateStart, dateEnd);
    // Осталось минут
    const leftDuration = durationMinutes(dateStart, currentStart, true);
    // Загружено минут
    const completedDuration = totalDuration - leftDuration;
    // Процент выполнения
    const percent = completedPercent(completedDuration, totalDuration);
    let nextDate;
    // Если дата начала импорта раньше чем дата первой загруженной свечи
    if (dateStart.isBefore(currentStart)) {
      // Формируем параметры нового запроса на импорт
      nextDate = currentStart.toJSON();
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
  throw response;
}

module.exports = loadCandles;
