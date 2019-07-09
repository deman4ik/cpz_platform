import { cpz } from "../types/cpz";
import dayjs from "../lib/dayjs";

function durationUnit(
  dateFrom: string | number,
  dateTo: string | number,
  unit: cpz.TimeUnit
): number {
  return dayjs.utc(dateTo).diff(dayjs.utc(dateFrom), unit);
}

function createDatesList(
  dateFrom: string | number,
  dateTo: string | number,
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

function createMinutesListWithRange(
  dateFrom: string | number,
  dateTo: string | number,
  duration = durationUnit(dateFrom, dateTo, cpz.TimeUnit.minute)
): { dateFrom: number; dateTo: number }[] {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    const date = dayjs.utc(dateFrom).add(i, cpz.TimeUnit.minute);
    list.push({
      dateFrom: date.valueOf(),
      dateTo: date.endOf(cpz.TimeUnit.minute).valueOf()
    });
  }
  return list;
}

export { durationUnit, createDatesList, createMinutesListWithRange };
