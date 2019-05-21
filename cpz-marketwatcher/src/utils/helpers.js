import dayjs from "cpz/utils/dayjs";

function getCurrentTimeframes(timeframes, inputDate) {
  const date = dayjs.utc(inputDate);
  /* Количество секунд 0-59 */
  const second = date.second();
  /* Инициализируем массив подходящих таймфреймов */
  const currentTimeframes = [];
  /* Если начало минуты */
  if (second === 0) {
    /* Количество часов 0-23 */
    const hour = date.hour();
    /* Количество минут 0-59 */
    const minute = date.minute();
    /* Проверяем все переданные таймфреймы */
    timeframes.forEach(timeframe => {
      /* Если одна минута */
      if (timeframe === 1) {
        /* Минимально возможный таймфрейм */
        currentTimeframes.push(timeframe);
      } else if (timeframe < 60) {
        /* Если меньше часа */
        /* Проверяем текущую минуту */
        if (minute % timeframe === 0) currentTimeframes.push(timeframe);
        /* В остальных случаях проверяем текущий час и минуту */
      } else if (hour % (timeframe / 60) === 0 && minute % timeframe === 0) {
        currentTimeframes.push(timeframe);
      }
    });
  }
  /* Возвращаем массив доступных таймфреймов */
  return currentTimeframes;
}

export { getCurrentTimeframes };
