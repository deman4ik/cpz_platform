import { cpz } from "../types/cpz";
import dayjs from "../lib/dayjs";

function durationUnit(
  dateFrom: string,
  dateTo: string,
  unit: cpz.TimeUnit
): number {
  return dayjs.utc(dateTo).diff(dayjs.utc(dateFrom), unit);
}

function createDatesList(
  dateFrom: string,
  dateTo: string,
  unit: cpz.TimeUnit,
  duration: number = durationUnit(dateFrom, dateTo, unit)
): number[] {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    list.push(
      dayjs
        .utc(dateFrom)
        .add(i, unit)
        .valueOf()
    );
  }
  return list;
}

export { durationUnit, createDatesList };
