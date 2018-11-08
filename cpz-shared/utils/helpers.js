import { v4 as uuid } from "uuid";
import dayjs from "./lib/dayjs";
import { REALTIME_MODE, EMULATOR_MODE, BACKTEST_MODE } from "../config/state";

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
 * Считывание текущего режима работы из темы события EventGrid
 * Возвращает полный вариант
 *
 * @param {string} eventSubject
 */
function getModeFromSubject(eventSubject) {
  const str = eventSubject.slice(-1);
  switch (str) {
    case "R":
      return REALTIME_MODE;
    case "E":
      return EMULATOR_MODE;
    case "B":
      return BACKTEST_MODE;
    default:
      return REALTIME_MODE;
  }
}

/**
 * Считывание текущего режима работы из темы события EventGrid
 * Возвращает сокращенный вариант
 *
 * @param {string} eventSubject
 */
function subjectToStr(eventSubject) {
  const str = eventSubject.slice(-1);
  switch (str) {
    case "R":
      return "R";
    case "E":
      return "E";
    case "B":
      return "B";
    default:
      return "R";
  }
}

/**
 * Сокращение наименования состояния сервиса
 *
 * @param {string} mode
 */
function modeToStr(mode) {
  switch (mode) {
    case REALTIME_MODE:
      return "R";
    case EMULATOR_MODE:
      return "E";
    case BACKTEST_MODE:
      return "B";

    default:
      return "R";
  }
}

/**
 * Инвертированный timestamp (количество секунд с условного конца отсчета)
 */
function getInvertedTimestamp() {
  const inverted = new Date("3000-01-01").valueOf() - new Date().valueOf();
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
  const inverted = getInvertedTimestamp();
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
  const duration = dayjs(dateTo).diff(dayjs(dateFrom), "minutes");
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
  const date = dayjs(inputDate);
  const prev = date.add(-1, "minute");
  return {
    dateFrom: prev.startOf("minute"),
    dateTo: prev.endOf("minute")
  };
}

function arraysDiff(full, part) {
  return full.filter(v => !part.includes(v));
}

export {
  tryParseJSON,
  getModeFromSubject,
  subjectToStr,
  modeToStr,
  generateKey,
  durationMinutes,
  completedPercent,
  getPreviousMinuteRange,
  arraysDiff
};
