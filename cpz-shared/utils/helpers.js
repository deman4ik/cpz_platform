import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import UTCPlugin from "./lib/dayjs/plugin/utc";
import { REALTIME_MODE, EMULATOR_MODE, BACKTEST_MODE } from "../config/state";

/* dayjs в режиме UTC */
dayjs.extend(UTCPlugin);

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
function getPreviousMinuteRange(date = dayjs()) {
  const prev = date.add(-1, "minute");
  return {
    dateFrom: prev.startOf("minute"),
    dateTo: prev.endOf("minute")
  };
}

/**
 * Отбор подходящих по времени таймфреймов для формирования
 *
 * @param {Array} timeframes
 * @param {dayjs} date
 */
function getCurrentTimeframes(timeframes, date = dayjs()) {
  /* Количество часов 0-23 */
  const hour = date.hour();
  /* Количество минут 0-59 */
  const minute = date.minute();
  /* Инициализируем массив подходящих таймфреймов */
  let currentTimeframes = [];
  /* Проверяем все переданные таймфреймы */
  timeframes.forEach(timeframe => {
    /* Если одна минута */
    if (timeframe === 1) {
      /* Минимально возможный таймфрейм - пропускаем */
      return;
    }
    /* Если меньше часа */
    if (timeframe < 60) {
      /* Проверяем текущую минуту */
      if (minute % timeframe === 0) currentTimeframes.push(timeframe);
      /* В остальных случаях проверяем текущий час и минуту */
    } else if (hour % (timeframe / 60) === 0 && minute % timeframe === 0)
      currentTimeframes.push(timeframe);
  });
  /* Если есть хотя бы один подходящий таймфрейм */
  if (currentTimeframes.length > 0)
    /* Сортируем в порядке убывания */
    currentTimeframes = currentTimeframes.sort((a, b) => a < b);
  /* Возвращаем массив доступных таймфреймов */
  return currentTimeframes;
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
  getCurrentTimeframes
};
