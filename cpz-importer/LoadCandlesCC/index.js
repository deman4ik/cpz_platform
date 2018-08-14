const moment = require("moment");
const fetch = require("node-fetch");
const HttpsProxyAgent = require("https-proxy-agent");
const { histoDay, histoHour, histoMinute } = require("../utils/cryptocompare");
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

async function LoadCandlesCC(context, input) {
  try {
    context.log("LoadCandlesCC");
    context.log(input);

    let agent;
    if (input.proxy) {
      agent = new HttpsProxyAgent(input.proxy);
    }

    const options = {
      fsym: input.baseq,
      tsym: input.quote,
      exchange: input.exchange,
      limit: input.limit || 500,
      timestamp: moment(input.dateTo).unix()
    };
    let url;
    // Запрашиваем исторические свечи
    switch (input.timeframe) {
      case "1m":
        url = histoMinute(options);
        break;
      case "1h":
        url = histoHour(options);
        break;
      case "1d":
        url = histoDay(options);
        break;
      default:
        throw new Error("Unknown timeframe. Must be: '1m', '1h', '1d'.");
    }
    const response = await fetchJSON(url, agent);
    // Если есть результат
    if (response && response.Data.length > 0) {
      let next;

      const timefrom = moment
        .unix(response.TimeFrom)
        .utc()
        .format();

      /* const timeTo = moment
        .unix(response.TimeTo)
        .utc()
        .format(); */
      // Дата начала импорта
      const endDate = input.endDate || input.dateTo;
      // Дата первой загруженный свечи
      const lastDate = timefrom;
      // Дата начала импорта
      const { dateFrom } = input;
      // Всего минут
      const totalDuration =
        input.totalDuration || durationMinutes(dateFrom, endDate);
      // Осталось минут
      const leftDuration = durationMinutes(dateFrom, lastDate, true);
      // Загружено минут
      const completedDuration = totalDuration - leftDuration;
      // Процент выполнения
      const percent = completedPercent(completedDuration, totalDuration);

      // Если дата начала импорта раньше чем дата первой загруженной свечи
      if (moment(dateFrom).isBefore(lastDate)) {
        // Формируем параметры нового запроса на импорт
        next = {
          ...input,
          timeout: 500,
          endDate,
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
      /* Преобразуем объект в массив */
      const data = response.Data.map(item => [
        item.time,
        item.open,
        item.high,
        item.low,
        item.close,
        item.volumefrom
      ]);
      // Результат выполнения
      const result = {
        input, // старые параметры запроса
        next, // новые параметры запроса, если необходимо
        status, // текущий статус выполнения задачи
        data // полученные данные
      };
      context.log(result);
      return result;
    }
  } catch (err) {
    context.log(err);
    throw err;
  }
  throw new Error("Error loading HistoHourCC");
}

module.exports = LoadCandlesCC;
