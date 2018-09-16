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
  context.log("loadCandles");
  context.log(input);

  const agent = new HttpsProxyAgent(input.proxy || process.env.PROXY_ENDPOINT);

  const options = {
    fsym: input.asset,
    tsym: input.currency,
    exchange: input.exchange,
    limit: input.limit || 500
  };
  if (input.nextDate) options.timestamp = dayjs(input.nextDate).unix();
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
        time: latestCandle.time,
        open: latestCandle.open,
        close: latestCandle.close,
        high: latestCandle.high,
        low: latestCandle.low,
        volume: latestCandle.volumefrom
      };
    }
    const timeFrom = dayjs
      .unix(response.TimeFrom)
      .utc()
      .format();
    // Дата конца импорта
    const dateEnd = input.dateTo;
    // Дата первой загруженный свечи
    const dateStart = timeFrom;
    // Дата начала импорта
    const { dateFrom } = input;
    // Всего минут
    const totalDuration =
      input.totalDuration || durationMinutes(dateFrom, dateEnd);
    // Осталось минут
    const leftDuration = durationMinutes(dateFrom, dateStart, true);
    // Загружено минут
    const completedDuration = totalDuration - leftDuration;
    // Процент выполнения
    const percent = completedPercent(completedDuration, totalDuration);
    let nextDate;
    // Если дата начала импорта раньше чем дата первой загруженной свечи
    if (dayjs(dateFrom).isBefore(dateStart)) {
      // Формируем параметры нового запроса на импорт
      nextDate = dayjs(dateStart)
        .utc()
        .format();
    }

    /* Преобразуем объект в массив */
    const data = response.Data.map(item => [
      item.time,
      item.open,
      item.high,
      item.low,
      item.close,
      item.volumefrom
    ]);
    // Исключаем последний элемент из массива с неполной свечей
    data.pop();
    // Результат выполнения
    const result = {
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
