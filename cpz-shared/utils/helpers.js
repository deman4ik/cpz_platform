import { v4 as uuid } from "uuid";
import dayjs from "./lib/dayjs";

function sortAsc(a, b) {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }
  return 0;
}

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
 * @param {*} jsonString
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
 */
function getInvertedTimestamp(time) {
  const inverted =
    new Date("3000-01-01").valueOf() -
    dayjs(time)
      .utc()
      .valueOf();
  const invertedString = inverted.toString();
  const pad = "000000000000000";

  return pad.substring(0, pad.length - invertedString.length) + invertedString;
}

/**
 * Генерация ключа строки
 * Каждое новое значение всегда меньше предыдущего
 * Применяется в Azure Table Storage для DESC сортировки строк в таблице по RowKey
 */
function generateKey() {
  const inverted = getInvertedTimestamp(dayjs().utc());
  const uid = uuid();
  return `${inverted}_${uid}`;
}

/**
 * Количество минут между двумя датами
 *
 * @param {*} dateFrom
 * @param {*} dateTo
 * @param {boolean} positive
 */
function durationMinutes(dateFrom, dateTo, positive = false) {
  const duration = dayjs(dateTo)
    .utc()
    .diff(dayjs(dateFrom).utc(), "minutes");
  if (positive) return duration > 0 ? duration : 0;
  return duration;
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
 * @param {dayjs} date
 */
function getPreviousMinuteRange(inputDate) {
  const date = dayjs(inputDate).utc();
  const prev = date.add(-1, "minute");
  return {
    dateFrom: prev.startOf("minute"),
    dateTo: prev.endOf("minute")
  };
}

function divideDateByDays(inputDateFrom, inputDateTo) {
  const dateFrom = dayjs(inputDateFrom).utc();
  const dateTo = dayjs(inputDateTo).utc();
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

function arraysDiff(full, part) {
  return full.filter(v => !part.includes(v));
}

function chunkArray(array, chunkSize) {
  const arrayToChunk = [...array];
  const results = [];
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize));
  }

  return results;
}

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

function chunkNumberToArray(number, chunkSize) {
  const range = createRange(number);
  const array = Array.from(range);
  const chunked = chunkArray(array, chunkSize).map(val => val.length);
  return chunked;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function filterOutNonUnique(arr) {
  const arrToFilter = [...arr];
  return arrToFilter.filter(
    i => arrToFilter.indexOf(i) !== arrToFilter.lastIndexOf(i)
  );
}
export {
  sortAsc,
  sortDesc,
  tryParseJSON,
  getInvertedTimestamp,
  generateKey,
  durationMinutes,
  completedPercent,
  getPreviousMinuteRange,
  divideDateByDays,
  arraysDiff,
  chunkArray,
  chunkNumberToArray,
  capitalize,
  filterOutNonUnique
};
