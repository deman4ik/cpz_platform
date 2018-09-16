/* const dayjs = require("dayjs");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const { durationMinutes, completedPercent } = require("../utils");

// Общий объект бирж для текущего инстанса
const exchanges = {};

async function loadCandles(context, input) {
  context.log("LoadCandlesCCXT");
  context.log(input);
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

  // Символ
  const symbol = `${input.asset}/${input.currency}`;
  // Запрашиваем исторические свечи
  const response = await exchanges[input.exchange].fetchOHLCV(
    symbol,
    input.timeframe,
    +dayjs(input.nextDate)
  );
  // Если есть результат
  if (response && response.length > 0) {
    const data = response;
    // Исключаем последний элемент из массива с неполной свечей
    data.pop();
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
    let nextDate;
    // Если дата конца импорта больше чем дата последней загруженной свечи
    if (dayjs(dateTo).isAfter(lastDate)) {
      // Формируем параметры нового запроса на импорт
      nextDate = dayjs(lastDate)
        .utc()
        .format();
    }

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
*/
