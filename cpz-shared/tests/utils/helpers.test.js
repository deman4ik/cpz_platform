import dayjs from "../../utils/dayjs";
import * as helpers from "../../utils/helpers";

describe("Array sorting methods", () => {
  test("Array should be sorted by asc", () => {
    const arr = [4, 5, 3, 3, 2, 1];
    const sortedArr = arr.sort(helpers.sortAsc);
    expect(sortedArr).toEqual([1, 2, 3, 3, 4, 5]);
  });

  test("Array should be sorted by desc", () => {
    const arr = [5, 1, 2, 3, 4, 4];
    const sortedArr = arr.sort(helpers.sortDesc);
    expect(sortedArr).toEqual([5, 4, 4, 3, 2, 1]);
  });
});

test("Should be correct JSON", () => {
  const correctJson =
    '{ "o": 3500, "h": 3900, "l": 3350, "c": 3453, "v": null}';
  const incorrectJson = "{o: 234}";
  expect(helpers.tryParseJSON(correctJson)).toEqual({
    o: 3500,
    h: 3900,
    l: 3350,
    c: 3453,
    v: null
  });
  expect(helpers.tryParseJSON(incorrectJson)).toBeFalsy();
});

test("Timestamp should be correct inverted", () => {
  const date = dayjs.utc("2019-01-30T13:02:00.000Z");
  const transformedTimestamp = helpers.getInvertedTimestamp(date);
  expect(transformedTimestamp).toBe("030954826680000");
});

test("Should be successful Key ", () => {
  expect(helpers.generateInvertedKey()).toMatch(
    /^\d{15}_[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );
});

describe("Should be return correct duration", () => {
  test("Duration should be return only positive value greater or equal than 0", () => {
    const dateFrom = dayjs.utc("2019-01-10T00:00:00.000Z");
    const dateTo = dayjs.utc("2019-01-09T00:00:00.000Z");
    expect(
      helpers.durationMinutes(dateFrom, dateTo, true)
    ).toBeGreaterThanOrEqual(0);
  });
  test("Duration should be any positive or negative number value", () => {
    const dateFrom = dayjs.utc("2019-01-10T00:00:00.000Z");
    const dateTo = dayjs.utc("2019-01-09T00:00:00.000Z");
    expect(typeof helpers.durationMinutes(dateFrom, dateTo, false)).toBe(
      "number"
    );
  });
});

test("Should be number - duration in timeframes", () => {
  const dateFrom = dayjs.utc("2019-01-09T00:00:00.000Z");
  const dateTo = dayjs.utc("2019-01-10T00:00:00.000Z");
  const timeframeInMinutes = 60;
  expect(
    helpers.durationInTimeframe(dateFrom, dateTo, timeframeInMinutes)
  ).toBe(24);
});

test('Should be calculated correct "percentage of progress"', () => {
  const currentValue = 23;
  const totalValue = 130;
  expect(helpers.completedPercent(currentValue, totalValue)).toBe(18);
});

test("Previous minute range should be return", () => {
  const time = dayjs.utc("2019-01-12T00:00:00.000Z");
  const range = helpers.getPreviousMinuteRange(time);
  expect(typeof range).toBe("object");
  expect(range.dateFrom.valueOf()).toBe(1547251140000);
  expect(range.dateTo.valueOf()).toBe(1547251199999);
  expect(range.dateTo).toBeInstanceOf(dayjs);
  expect(range.dateFrom).toBeInstanceOf(dayjs);
});

describe("Devide date by days", () => {
  test("Should be correct array of date object (full days)", () => {
    const dateFrom = dayjs.utc("2019-01-12T01:00:00.000Z");
    const dateTo = dayjs.utc("2019-01-14T01:00:00.000Z");
    const arrayOfDate = helpers.divideDateByDays(dateFrom, dateTo);
    expect(Array.isArray(arrayOfDate)).toBeTruthy();
    expect(arrayOfDate).toHaveLength(2);
    expect(arrayOfDate).toContainEqual({
      dateFrom: "2019-01-12T01:00:00.000Z",
      dateTo: "2019-01-13T01:00:00.000Z",
      duration: 1440
    });
  });

  test("Should be correct array of date object (not full days)", () => {
    const dateFrom = dayjs.utc("2019-01-12T21:34:54.000Z");
    const dateTo = dayjs.utc("2019-01-16T14:43:12.000Z");
    const arrayOfDate = helpers.divideDateByDays(dateFrom, dateTo);
    expect(Array.isArray(arrayOfDate)).toBeTruthy();
    expect(arrayOfDate).toHaveLength(4);
    expect(arrayOfDate).toContainEqual({
      dateFrom: "2019-01-15T21:34:54.000Z",
      dateTo: "2019-01-16T14:43:12.000Z",
      duration: 1028
    });
  });
});

test("Should be correct diff arrays", () => {
  const fullArr = [1, 2, 3, 4, 5];
  const partOfArr = [4, 2];
  expect(helpers.arraysDiff(fullArr, partOfArr)).toEqual([1, 3, 5]);
});

test("Dividing the array into packs has passed correctly.", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const chunkLength = 2;
  const chunkedArr = helpers.chunkArray(arr, chunkLength);
  expect(Array.isArray(chunkedArr)).toBeTruthy();
  expect(chunkedArr).toHaveLength(5);
  expect(chunkedArr).toContainEqual([5, 6]);
});

test("Should be split the number by packs", () => {
  const initValue = 10;
  const chunkSize = 3;
  const resultedArr = helpers.chunkNumberToArray(initValue, chunkSize);
  expect(Array.isArray(resultedArr)).toBeTruthy();
  expect(resultedArr).toHaveLength(4);
  expect(resultedArr).toContain(3);
});

test("Should be capitalized string", () => {
  const str = "cryptocurrency";
  expect(helpers.capitalize(str)).toBe("Cryptocurrency");
});

test("Should be filtered out non unique values", () => {
  const arr = [1, 2, 2, 3, 4, 5, 5, 5, 6, 7, 8, 9];
  expect(helpers.filterOutNonUnique(arr)).toEqual([2, 2, 5, 5, 5]);
});

test("Should be correcting to precision 5", () => {
  const initValue = 1.3445463424;
  const precision = 3;
  expect(helpers.precision(initValue, precision)).toBe(1.345);
});

describe("Correct with limit", () => {
  test("Should be adjusted according to valid values [12, 4, 11]", () => {
    const [initValue, min, max] = [12, 4, 11];
    expect(helpers.correctWithLimit(initValue, min, max)).toBe(11);
  });

  test("Should be adjusted according to valid values [3, 4, 11]", () => {
    const [initValue, min, max] = [3, 4, 11];
    expect(helpers.correctWithLimit(initValue, min, max)).toBe(4);
  });

  test("Should be adjusted according to valid values [5, 4, 11]", () => {
    const [initValue, min, max] = [5, 4, 11];
    expect(helpers.correctWithLimit(initValue, min, max)).toBe(5);
  });
});

describe("Should return query by path", () => {
  test("Should return query by objects", () => {
    expect(helpers.getQueryByPath({ a: { c: "d" } }, "a.c")).toEqual("d");
  });

  test("Should return undefined if query not reachable", () => {
    expect(helpers.getQueryByPath({ a: "a" }, "a.b.c")).toEqual(undefined);
  });

  test("Should return query by array", () => {
    expect(helpers.getQueryByPath({ a: [{ c: "d" }] }, "a[0]c")).toEqual("d");
  });

  test("Should delete empty keys", () => {
    expect(helpers.getQueryByPath([[0, { "2": 3 }]], "[0][1][2]")).toEqual(3);
  });
});

describe("Should return bool - does query have", () => {
  test("Should return true by objects", () => {
    expect(helpers.hasQueryByPath({ a: { c: "d" } }, "a.c")).toEqual(true);
  });

  test("Should return false if query not reachable", () => {
    expect(helpers.hasQueryByPath({ a: "a" }, "a.b.c")).toEqual(false);
  });

  test("Should return true by arrays", () => {
    expect(helpers.hasQueryByPath({ a: [{ c: "d" }] }, "a[0]c")).toEqual(true);
  });

  test("Should delete empty keys", () => {
    expect(helpers.hasQueryByPath([[0, { "2": 3 }]], "[0][1][2]")).toEqual(
      true
    );
  });
});
