import dayjs from "../lib/dayjs";
import { cpz } from "../types/cpz";
import { round, sortAsc } from "./helpers";

class Timeframe {
  private static _timeframes: cpz.Timeframes = {
    1: {
      str: "1m",
      value: 1,
      lower: 1,
      unit: cpz.TimeUnit.minute,
      amountInUnit: 1
    },
    5: {
      str: "5m",
      value: 5,
      lower: 1,
      unit: cpz.TimeUnit.minute,
      amountInUnit: 5
    },
    15: {
      str: "15m",
      value: 15,
      lower: 1,
      unit: cpz.TimeUnit.minute,
      amountInUnit: 15
    },
    30: {
      str: "30m",
      value: 30,
      lower: 1,
      unit: cpz.TimeUnit.minute,
      amountInUnit: 30
    },
    60: {
      str: "1h",
      value: 60,
      lower: 60,
      unit: cpz.TimeUnit.hour,
      amountInUnit: 1
    },
    120: {
      str: "2h",
      value: 120,
      lower: 60,
      unit: cpz.TimeUnit.hour,
      amountInUnit: 2
    },
    240: {
      str: "4h",
      value: 240,
      lower: 60,
      unit: cpz.TimeUnit.hour,
      amountInUnit: 4
    },
    480: {
      str: "8h",
      value: 480,
      lower: 60,
      unit: cpz.TimeUnit.hour,
      amountInUnit: 8
    },
    720: {
      str: "12h",
      value: 720,
      lower: 60,
      unit: cpz.TimeUnit.hour,
      amountInUnit: 12
    },
    1440: {
      str: "1d",
      value: 1440,
      lower: 1440,
      unit: cpz.TimeUnit.day,
      amountInUnit: 1
    }
  };

  public static get timeframes(): cpz.Timeframes {
    return this._timeframes;
  }

  public static get(timeframe: cpz.Timeframe): cpz.TimeframeProps {
    if (!this.exists(timeframe)) throw new Error("Invalid timeframe");
    return this.timeframes[timeframe];
  }

  public static get validArray(): cpz.Timeframe[] {
    return Object.keys(this.timeframes).map(t => +t);
  }

  static exists(timeframe: cpz.Timeframe | string): boolean {
    if (typeof timeframe === "number") return !!this.timeframes[timeframe];
    return (
      Object.values(this.timeframes).filter(t => t.str === timeframe).length ===
      1
    );
  }

  static toString(timeframe: cpz.Timeframe): string {
    const { str } = this.get(timeframe);
    return str;
  }

  static stringToTimeframe(str: string): cpz.Timeframe {
    const timeframe = Object.values(this.timeframes).find(t => t.str === str);
    if (timeframe) return timeframe.value;
    return null;
  }

  static inList(timeframes: cpz.ExchangeTimeframes, str: string): boolean {
    return str in timeframes;
  }

  static timeframeAmountToTimeUnit(
    amount: number,
    timeframe: cpz.Timeframe
  ): { amount: number; unit: cpz.TimeUnit } {
    const { amountInUnit, unit } = this.get(timeframe);
    return {
      amount: round(amount * amountInUnit),
      unit
    };
  }

  static checkTimeframeByDate(
    hour: number,
    minute: number,
    timeframe: cpz.Timeframe
  ): boolean {
    /* Если одна минута */
    if (timeframe === 1) {
      /* Минимально возможный таймфрейм */
      return true;
    }
    /* Если меньше часа */
    if (timeframe < 60) {
      /* Проверяем текущую минуту */
      if (minute % timeframe === 0) return true;
      /* В остальных случаях проверяем текущий час и минуту */
    } else if (hour % (timeframe / 60) === 0 && minute % timeframe === 0)
      return true;

    return false;
  }

  static isTimeframeByDate(
    inputDate: string | number,
    timeframe: cpz.Timeframe
  ): boolean {
    const date = dayjs.utc(inputDate);
    if (date.second() !== 0) return false;
    /* Количество часов 0-23 */
    const hour = date.hour();
    /* Количество минут 0-59 */
    const minute = date.minute();
    return this.checkTimeframeByDate(hour, minute, timeframe);
  }

  static timeframesByDate(inputDate: string): cpz.Timeframe[] {
    const date = dayjs.utc(inputDate);

    if (date.second() !== 0) return [];

    /* Количество часов 0-23 */
    const hour = date.hour();
    /* Количество минут 0-59 */
    const minute = date.minute();

    /* Проверяем все таймфреймы */
    let currentTimeframes: cpz.Timeframe[] = this.validArray.filter(timeframe =>
      this.checkTimeframeByDate(hour, minute, timeframe)
    );
    /* Если есть хотя бы один подходящий таймфрейм */
    if (currentTimeframes.length > 0)
      /* Сортируем в порядке убывания */
      currentTimeframes = currentTimeframes.sort(sortAsc);
    /* Возвращаем массив доступных таймфреймов */
    return currentTimeframes;
  }

  static durationTimeframe(
    dateFrom: string,
    dateTo: string,
    timeframe: cpz.Timeframe
  ): number {
    const { amountInUnit, unit } = this.get(timeframe);
    const duration = dayjs
      .utc(dateTo)
      .add(1, "millisecond")
      .diff(dayjs.utc(dateFrom), unit);
    return round(duration / amountInUnit);
  }

  static getCurrentSince(amount: number, timeframe: cpz.Timeframe): number {
    const currentDate = dayjs.utc();
    const { amountInUnit, unit } = this.get(timeframe);

    if (
      amount === 1 &&
      (timeframe === 1 || timeframe === 60 || timeframe === 1440)
    )
      return currentDate.startOf(unit).valueOf();

    if (timeframe === 1) {
      return currentDate
        .add(-amount, unit)
        .startOf(unit)
        .valueOf();
    }

    return currentDate
      .add(-currentDate[unit]() % (amount * amountInUnit), unit)
      .startOf(unit)
      .valueOf();
  }
}

export default Timeframe;
