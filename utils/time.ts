import { cpz } from "../@types";
import dayjs from "../lib/dayjs";

function durationUnit(
  dateFrom: string,
  dateTo: string,
  amountInUnit: number = 1,
  unit: cpz.TimeUnit
): number {
  return dayjs.utc(dateTo).diff(dayjs.utc(dateFrom), unit) / amountInUnit;
}

function createDatesList(
  dateFrom: string,
  dateTo: string,
  unit: cpz.TimeUnit,
  amountInUnit: number = 1,
  duration: number = durationUnit(dateFrom, dateTo, amountInUnit, unit)
): number[] {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    list.push(
      dayjs
        .utc(dateFrom)
        .add(i * amountInUnit, unit)
        .valueOf()
    );
  }
  return list;
}

function createDatesListWithRange(
  dateFrom: string,
  dateTo: string,
  unit: cpz.TimeUnit,
  amountInUnit: number = 1,
  duration: number = durationUnit(dateFrom, dateTo, amountInUnit, unit)
): { dateFrom: number; dateTo: number }[] {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    const date = dayjs.utc(dateFrom).add(i * amountInUnit, unit);
    list.push({
      dateFrom: date.valueOf(),
      dateTo: date
        .add(amountInUnit - 1, unit)
        .endOf(unit)
        .valueOf()
    });
  }
  return list;
}

function chunkDates(
  dateFrom: string,
  dateTo: string,
  unit: cpz.TimeUnit,
  amountInUnit: number = 1,
  chunkSize: number
) {
  const list = createDatesListWithRange(
    dateFrom,
    dateTo,
    unit,
    amountInUnit,
    durationUnit(dateFrom, dateTo, amountInUnit, unit) + 1
  );
  const arrayToChunk = [...list];
  const chunks = [];
  const endDate = dayjs.utc(dateTo).valueOf();
  while (arrayToChunk.length) {
    const chunk = arrayToChunk.splice(0, chunkSize);
    chunks.push({
      dateFrom: dayjs.utc(chunk[0].dateFrom).toISOString(),
      dateTo:
        dayjs.utc(chunk[chunk.length - 1].dateTo).valueOf() > endDate
          ? dateTo
          : dayjs.utc(chunk[chunk.length - 1].dateTo).toISOString()
    });
  }

  return { chunks, total: list.length };
}

function getValidDate(
  date: string,
  unit: cpz.TimeUnit = cpz.TimeUnit.minute
): string {
  if (
    dayjs
      .utc(date)
      .startOf(unit)
      .valueOf() <
    dayjs
      .utc()
      .startOf(unit)
      .valueOf()
  )
    return dayjs
      .utc(date)
      .startOf(unit)
      .toISOString();

  return dayjs
    .utc()
    .startOf(unit)
    .toISOString();
}
export {
  durationUnit,
  createDatesList,
  createDatesListWithRange,
  chunkDates,
  getValidDate
};
