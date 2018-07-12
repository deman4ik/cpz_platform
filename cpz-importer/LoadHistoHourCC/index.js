const moment = require("moment");
const cc = require("../utils/cryptocompare");

async function LoadHistoHourCC(context, input) {
  try {
    context.log("LoadHour");
    context.log(input);

    // Запрашиваем исторические свечи
    const response = await cc.histoHour(input.baseq, input.quote, {
      exchange: input.exchange,
      timestamp: moment(input.dateTo).toDate()
    });
    // Если есть результат
    if (response && response.Data.length > 0) {
      let next;

      const timefrom = moment
        .unix(response.TimeFrom)
        .utc()
        .format();

      const timeTo = moment
        .unix(response.TimeTo)
        .utc()
        .format();
      // Дата начала импорта
      const endDate = input.endDate || input.dateTo;
      // Дата первой загруженный свечи
      const lastDate = timefrom;
      // Дата начала импорта
      const { dateFrom } = input;
      // Всего минут
      const totalDuration =
        input.totalDuration ||
        moment.duration(moment(endDate).diff(moment(dateFrom))).asMinutes();
      // Осталось минут
      let leftDuration = moment
        .duration(moment(lastDate).diff(dateFrom))
        .asMinutes();
      // Не может быть меньше нуля
      leftDuration = leftDuration > 0 ? leftDuration : 0;
      // Загружено минут
      const completedDuration = totalDuration - leftDuration;
      // Процент выполнения
      let percent = (completedDuration / totalDuration) * 100;
      // Не может быть больше 100
      percent = percent <= 100 ? percent : 100;
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
      // Результат выполнения
      const result = {
        input, // старые параметры запроса
        next, // новые параметры запроса, если необходимо
        status, // текущий статус выполнения задачи
        data: response.Data // полученные данные
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

module.exports = LoadHistoHourCC;
