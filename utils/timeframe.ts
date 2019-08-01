import dayjs from "../lib/dayjs";
import { cpz } from "../types/cpz";
import { sortDesc } from "./helpers";

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

  public static get(timeframe: cpz.ValidTimeframe): cpz.TimeframeProps {
    if (!this.exists(timeframe)) throw new Error("Invalid timeframe");
    return this.timeframes[timeframe];
  }

  public static get validArray(): cpz.ValidTimeframe[] {
    return Object.keys(this.timeframes).map(t => +t);
  }

  static exists(timeframe: cpz.ValidTimeframe | string): boolean {
    if (typeof timeframe === "number") return !!this.timeframes[timeframe];
    return (
      Object.values(this.timeframes).filter(t => t.str === timeframe).length ===
      1
    );
  }

  static toString(timeframe: cpz.ValidTimeframe): string {
    const { str } = this.get(timeframe);
    return str;
  }

  static stringToTimeframe(str: string): cpz.ValidTimeframe {
    const timeframe = Object.values(this.timeframes).find(t => t.str === str);
    if (timeframe) return timeframe.value;
    return null;
  }

  static inList(timeframes: cpz.ExchangeTimeframes, str: string): boolean {
    return str in timeframes;
  }

  static timeframeAmountToTimeUnit(
    amount: number,
    timeframe: cpz.ValidTimeframe
  ): { amount: number; unit: cpz.TimeUnit } {
    const { amountInUnit, unit } = this.get(timeframe);
    return {
      amount: Math.floor(amount * amountInUnit),
      unit
    };
  }

  static checkTimeframeByDate(
    hour: number,
    minute: number,
    timeframe: cpz.ValidTimeframe
  ): boolean {
    /* Если одна минута */
    if (timeframe === 1) {
      /* Минимально возможный таймфрейм - пропускаем */
      return false;
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

  static isValidTimeframeByDate(
    inputDate: string | number,
    timeframe: cpz.ValidTimeframe
  ): boolean {
    const date = dayjs.utc(inputDate);
    /* Количество часов 0-23 */
    const hour = date.hour();
    /* Количество минут 0-59 */
    const minute = date.minute();

    return this.checkTimeframeByDate(hour, minute, timeframe);
  }

  static timeframesByDate(inputDate: string): cpz.ValidTimeframe[] {
    const date = dayjs.utc(inputDate);
    /* Количество часов 0-23 */
    const hour = date.hour();
    /* Количество минут 0-59 */
    const minute = date.minute();
    /* Проверяем все таймфреймы */
    let currentTimeframes: cpz.ValidTimeframe[] = this.validArray.filter(
      timeframe => this.checkTimeframeByDate(hour, minute, timeframe)
    );
    /* Если есть хотя бы один подходящий таймфрейм */
    if (currentTimeframes.length > 0)
      /* Сортируем в порядке убывания */
      currentTimeframes = currentTimeframes.sort(sortDesc);
    /* Возвращаем массив доступных таймфреймов */
    return currentTimeframes;
  }

  static durationTimeframe(
    dateFrom: string,
    dateTo: string,
    timeframe: cpz.ValidTimeframe
  ): number {
    const { amountInUnit, unit } = this.get(timeframe);
    const duration = dayjs.utc(dateTo).diff(dayjs.utc(dateFrom), unit);
    return Math.floor(duration / amountInUnit);
  }

  static getCurrentSince(
    amount: number,
    timeframe: cpz.ValidTimeframe
  ): number {
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