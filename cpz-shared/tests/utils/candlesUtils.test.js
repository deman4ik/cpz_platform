import * as candlesUtils from "../../utils/candlesUtils";
import dayjs from "../../utils/lib/dayjs";
import * as helpers from "../../utils/helpers";

describe("Correct choose from timeframes", () => {
  const timeframes = [1, 15, 60, 1440];
  test("Should be [15]", () => {
    const inputDate = dayjs("2019-02-01T10:15:44.118Z").utc();
    expect(candlesUtils.getCurrentTimeframes(timeframes, inputDate)).toEqual([
      15
    ]);
  });
  test("Should be [] ", () => {
    const inputDate = dayjs("2019-02-01T10:14:44.118Z").utc();
    expect(candlesUtils.getCurrentTimeframes(timeframes, inputDate)).toEqual(
      []
    );
  });
});

describe("Create array of minutes between input dates", () => {
  const dateFrom = dayjs("2019-01-31T10:08:44.118Z").utc();
  const dateTo = dayjs("2019-01-31T10:13:44.118Z").utc();
  let duration = 0;
  beforeAll(() => {
    duration = helpers.durationMinutes(dateFrom, dateTo, true);
  });
  test("Should be correct minute's array (with duration param)", () => {
    expect(candlesUtils.createMinutesList(dateFrom, dateTo, duration)).toEqual([
      1548929324118,
      1548929384118,
      1548929444118,
      1548929504118,
      1548929564118
    ]);
  });
  test("Should be correct minute's array (without duration param)", () => {
    expect(candlesUtils.createMinutesList(dateFrom, dateTo)).toEqual([
      1548929324118,
      1548929384118,
      1548929444118,
      1548929504118,
      1548929564118
    ]);
  });
});

describe("Create array of minutes between input dates with range", () => {
  const dateFrom = dayjs("2019-01-31T10:08:44.118Z").utc();
  const dateTo = dayjs("2019-01-31T10:11:44.118Z").utc();
  let duration = 0;
  beforeAll(() => {
    duration = helpers.durationMinutes(dateFrom, dateTo, true);
  });
  test("Should be correct minute's array (with duration param)", () => {
    expect(
      candlesUtils.createMinutesListWithRange(dateFrom, dateTo, duration)
    ).toEqual([
      {
        dateFrom: 1548929324118,
        dateTo: 1548929339999
      },
      {
        dateFrom: 1548929384118,
        dateTo: 1548929399999
      },
      {
        dateFrom: 1548929444118,
        dateTo: 1548929459999
      }
    ]);
  });
  test("Should be correct minute's array (without duration param)", () => {
    expect(
      candlesUtils.createMinutesListWithRange(dateFrom, dateTo, duration)
    ).toEqual([
      {
        dateFrom: 1548929324118,
        dateTo: 1548929339999
      },
      {
        dateFrom: 1548929384118,
        dateTo: 1548929399999
      },
      {
        dateFrom: 1548929444118,
        dateTo: 1548929459999
      }
    ]);
  });
});

describe("Returns an object with an array of date batches between the specified dates (the dateTo is not included)", () => {
  const dateFrom = dayjs("2019-01-30T10:08:44.118Z").utc();
  const dateTo = dayjs("2019-01-30T11:10:44.118Z").utc();
  const chunkSize = 30;
  test("Should be correct chunks", () => {
    const chunkDates = candlesUtils.chunkDates(dateFrom, dateTo, chunkSize);

    expect(Array.isArray(chunkDates.chunks)).toBeTruthy();
    expect(chunkDates.chunks).toHaveLength(3);
    expect(chunkDates.chunks[1].dateFrom).toBeInstanceOf(dayjs);
    expect(chunkDates.chunks[0].dateTo).toBeInstanceOf(dayjs);
    expect(chunkDates.chunks[2].dateFrom.utc().valueOf()).toBe(1548846524118);
    expect(chunkDates.chunks[1].dateTo.utc().valueOf()).toBe(1548846464118);
    expect(chunkDates.chunks[0].duration).toBe(30);
    expect(chunkDates.total).toBe(62);
  });
});

describe("Candle ID generation over time", () => {
  test("Should be true", () => {
    const date = dayjs("2019-01-30T10:10:44.118Z").utc();
    expect(candlesUtils.generateCandleRowKey(date)).toBe("030954836955882");
  });
});

// TODO need method parsenumber
/* describe("Getting the starting date of the maximum timeframe depending on the number of bars", () =>{
  test("Should be correct", () => {
    const timeframes = [1, 60, 5, 15];
    const maxBars = 2;
    expect(candlesUtils.getMaxTimeframeDateFrom(timeframes, maxBars)).toBe(0);
  });
}); */

// TODO need function createCachedCandleSlug
describe("Filling Candle Gaps in the Source Array", () => {
  const info = {
    exchange: "Binance",
    asset: "BTC",
    currency: "ETH",
    timeframe: 5,
    taskId: "10"
  };

  test("Should be 4 missing candles", () => {
    const dateFrom = dayjs(1548853200000).utc();
    const dateTo = dayjs(1548853800000).utc();
    const maxDuration = 5;
    const candles = [
      {
        time: 1548853200000,
        open: 3500,
        high: 3600,
        low: 3400,
        close: 3550,
        volume: 345
      },
      {
        time: 1548853800000,
        open: 3455,
        high: 3600,
        low: 3400,
        close: 3432,
        volume: 321
      }
    ];
    const gaps = candlesUtils.handleCandleGaps(
      info,
      dateFrom,
      dateTo,
      maxDuration,
      candles
    );
    expect(Array.isArray(gaps)).toBeTruthy();
    expect(gaps).toHaveLength(4);
    expect(gaps[0]).toHaveProperty("timestamp", "2019-01-30T13:01:00.000Z");
    expect(gaps[2]).toHaveProperty("timestamp", "2019-01-30T13:03:00.000Z");
    expect(gaps[0]).toHaveProperty("type", "previous");
    expect(gaps[2]).toHaveProperty("type", "previous");
    expect(gaps[0]).toHaveProperty("open", 3550);
    expect(gaps[2]).toHaveProperty("open", 3550);
  });

  test("Should be 4 missing candles with equal price (1 candle was get)", () => {
    const dateFrom = dayjs(1548853200000).utc();
    const dateTo = dayjs(1548853500000).utc();
    const maxDuration = 5;
    const candles = [
      {
        time: 1548853260000,
        open: 3455,
        high: 3600,
        low: 3400,
        close: 3432,
        volume: 321
      }
    ];
    const gaps = candlesUtils.handleCandleGaps(
      info,
      dateFrom,
      dateTo,
      maxDuration,
      candles
    );
    expect(Array.isArray(gaps)).toBeTruthy();
    expect(gaps).toHaveLength(3);
    expect(gaps[0]).toHaveProperty("timestamp", "2019-01-30T13:02:00.000Z");
    expect(gaps[2]).toHaveProperty("timestamp", "2019-01-30T13:04:00.000Z");
    expect(gaps[0]).toHaveProperty("type", "previous");
    expect(gaps[2]).toHaveProperty("type", "previous");
    expect(gaps[0]).toHaveProperty("open", 3432);
    expect(gaps[2]).toHaveProperty("open", 3432);
  });

  test("Should be empty array (no gaps)", () => {
    const dateFrom = dayjs(1548853200000).utc();
    const dateTo = dayjs(1548853260000).utc();
    const maxDuration = 2;
    const candles = [
      {
        time: 1548853200000,
        open: 3500,
        high: 3600,
        low: 3400,
        close: 3550,
        volume: 345
      },
      {
        time: 1548853260000,
        open: 3455,
        high: 3600,
        low: 3400,
        close: 3432,
        volume: 321
      }
    ];
    const gaps = candlesUtils.handleCandleGaps(
      info,
      dateFrom,
      dateTo,
      maxDuration,
      candles
    );
    expect(Array.isArray(gaps)).toBeTruthy();
    expect(gaps).toHaveLength(0);
  });

  test("Should be empty array (no gaps, because no candles was get)", () => {
    const dateFrom = dayjs(1548853200000).utc();
    const dateTo = dayjs(1548853260000).utc();
    const maxDuration = 2;
    const candles = [];
    const gaps = candlesUtils.handleCandleGaps(
      info,
      dateFrom,
      dateTo,
      maxDuration,
      candles
    );
    expect(Array.isArray(gaps)).toBeTruthy();
    expect(gaps).toHaveLength(0);
  });
});

describe("Get MAX timeframe from Object", () => {
  test("Should correct return (sorted object)", () => {
    const timeframes = { "1": {}, "5": {}, "15": {} };
    expect(candlesUtils.getMaxTimeframe(timeframes)).toBe(15);
  });
  test("Should correct return (unsorted object)", () => {
    const timeframes = { "5": {}, "15": {}, "1": {} };
    expect(candlesUtils.getMaxTimeframe(timeframes)).toBe(15);
  });
});

describe("Timeframe to time unit", () => {
  test("Should be correct return", () => {
    const timeframe = 15;
    const count = 3;
    expect(candlesUtils.timeframeToTimeUnit(count, timeframe)).toEqual({
      number: 45,
      unit: "minute"
    });
  });
});

describe("Get Max Timeframe Date From", () => {
  test("Should be correct ", () => {
    const timeframes = { "5": {}, "15": {}, "1": {} };
    expect(candlesUtils.getMaxTimeframeDateFrom(timeframes, 2)).toMatch(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
    );
  });
});
