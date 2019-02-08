import { v4 as uuid } from "uuid";
import dayjs from "./lib/dayjs";

/**
 * Сортировка по возрастанию
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Int}
 */
function sortAsc(a, b) {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }
  return 0;
}

/**
 * Сортировка по убыванию
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Int}
 */
function sortDesc(a, b) {
  if (a > b) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
}

/**
 * Парсинг JSON, если ошибка возвращает false
 *
 * @param {string} jsonString
 */
function tryParseJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Инвертированный timestamp (количество секунд с условного конца отсчета)
 *
 * @param {Date} time
 * @return {string}
 */
function getInvertedTimestamp(time) {
  const inverted = new Date("3000-01-01").valueOf() - dayjs.utc(time).valueOf();
  const invertedString = inverted.toString();
  const pad = "000000000000000";

  return pad.substring(0, pad.length - invertedString.length) + invertedString;
}

/**
 * Генерация ключа строки
 * Каждое новое значение всегда меньше предыдущего
 * Применяется в Azure Table Storage для DESC сортировки строк в таблице по RowKey
 *
 * @returns {string}
 */
function generateKey() {
  const inverted = getInvertedTimestamp(dayjs.utc());
  const uid = uuid();
  return `${inverted}_${uid}`;
}

/**
 * Количество минут между двумя датами
 *
 * @param {Date} dateFrom дата с
 * @param {Date} dateTo дата по
 * @param {boolean} positive возвращать только положительное число
 */
function durationMinutes(dateFrom, dateTo, positive = false) {
  const duration = dayjs.utc(dateTo).diff(dayjs.utc(dateFrom), "minutes");
  if (positive) return duration > 0 ? duration : 0;
  return duration;
}

/**
 * Количество минут между двумя датами в заданном таймфрейме
 *
 * @param {Date} dateFrom дата с
 * @param {Date} dateTo дата по
 * @param {Int} timeframe таймфрейм в минутах
 */
function durationInTimeframe(dateFrom, dateTo, timeframe) {
  const minutes = durationMinutes(dateFrom, dateTo);
  return Math.floor(minutes / timeframe);
}

/**
 * Процент выполнения
 *
 * @param {*} completedDuration
 * @param {*} totalDuration
 */
function completedPercent(completedDuration, totalDuration) {
  // Процент выполнения
  const percent = Math.round((completedDuration / totalDuration) * 100);
  // Не может быть больше 100
  return percent <= 100 ? percent : 100;
}

/**
 * Возвращает начало и конец предыдущей минуты
 *
 * @param {Date} inputDate
 */
function getPreviousMinuteRange(inputDate) {
  const date = dayjs.utc(inputDate);
  const prev = date.add(-1, "minute");
  return {
    dateFrom: prev.startOf("minute"),
    dateTo: prev.endOf("minute")
  };
}

/**
 * Разделение указанного периода по дням
 * в том числе учитывая не законченные дни
 *
 * @param {Date} inputDateFrom
 * @param {Date} inputDateTo
 */
function divideDateByDays(inputDateFrom, inputDateTo) {
  const dateFrom = dayjs.utc(inputDateFrom);
  const dateTo = dayjs.utc(inputDateTo);
  const dates = [];
  const duration = dateTo.diff(dateFrom, "day", true);
  for (let i = 0; i < duration; i += 1) {
    const newDateFrom = dateFrom.add(i, "day");
    let newDateTo = newDateFrom.add(1, "day");
    newDateTo = newDateTo.valueOf() < dateTo.valueOf() ? newDateTo : dateTo;
    const minutesDuration = durationMinutes(newDateFrom, newDateTo, true);
    dates.push({
      dateFrom: newDateFrom.toISOString(),
      dateTo: newDateTo.toISOString(),
      duration: minutesDuration
    });
  }
  return dates;
}

/**
 * Сравнение двух массивов
 *
 * @param {Array} full
 * @param {Array} part
 */
function arraysDiff(full, part) {
  return full.filter(v => !part.includes(v));
}

/**
 * Разделение массива по пачкам
 *
 * @param {Array} array
 * @param {number} chunkSize размер пачкм
 */
function chunkArray(array, chunkSize) {
  const arrayToChunk = [...array];
  const results = [];
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize));
  }
  return results;
}

/**
 * Создание числового ряда
 *
 * @param {Number} to
 * @param {Number} from
 */
function createRange(to, from = 1) {
  const range = {
    from,
    to
  };
  range[Symbol.iterator] = function iterator() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          this.current += 1;
          return { done: false, value: this.current };
        }
        return { done: true };
      }
    };
  };
  return range;
}

/**
 * Разбивка числа по пачкам
 *
 * @param {Number} number исзодное число
 * @param {Number} chunkSize размер пачки
 * @return {[Number]}
 */
function chunkNumberToArray(number, chunkSize) {
  const range = createRange(number);
  const array = Array.from(range);
  return chunkArray(array, chunkSize).map(val => val.length);
}

/**
 * Возвращает исходную строку с прописным первым символом
 *
 * @param {string} string исходная строка
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Отфильтровать не уникальные элементы массива
 *
 * @param {Array} arr
 */
function filterOutNonUnique(arr) {
  const arrToFilter = [...arr];
  return arrToFilter.filter(
    i => arrToFilter.indexOf(i) !== arrToFilter.lastIndexOf(i)
  );
}

/**
 * Корректировка точности числа
 *
 * @param {Number} x исходное число
 * @param {Number} n количество знаков после запятой
 */
function precision(x, n) {
  if (!x || !n) return x;
  const m = 10 ** n;
  return Math.round(x * m) / m;
}

/**
 * Корректировка числа согласно допустимым значениям
 *
 * @param {Number} x исходное число
 * @param {Number} min минимальное допустимое значение
 * @param {Number} max максимальное доапустимое значение
 */
function correctWithLimit(x, min, max) {
  if (min && x < min) return min;
  if (max && x > max) return max;
  return x;
}

export {
  sortAsc,
  sortDesc,
  tryParseJSON,
  getInvertedTimestamp,
  generateKey,
  durationMinutes,
  durationInTimeframe,
  completedPercent,
  getPreviousMinuteRange,
  divideDateByDays,
  arraysDiff,
  chunkArray,
  chunkNumberToArray,
  capitalize,
  filterOutNonUnique,
  precision,
  correctWithLimit
};
