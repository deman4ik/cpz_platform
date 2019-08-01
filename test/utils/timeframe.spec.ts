import MockDate from "mockdate";
import Timeframe from "../../utils/timeframe";
import dayjs from "../../lib/dayjs";

describe("Test 'Timeframe' class", () => {
  describe("Test 'get'", () => {
    it("should return timeframes properies for timeframe 1", () => {
      expect(Timeframe.get(1)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 5", () => {
      expect(Timeframe.get(5)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 15", () => {
      expect(Timeframe.get(15)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 30", () => {
      expect(Timeframe.get(30)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 60", () => {
      expect(Timeframe.get(60)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 120", () => {
      expect(Timeframe.get(120)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 240", () => {
      expect(Timeframe.get(240)).toBeTruthy();
    });
    it("should return timeframes properies for timeframe 1440", () => {
      expect(Timeframe.get(1440)).toBeTruthy();
    });
  });
  describe("Test 'durationTimeframe'", () => {
    it("should return duration in minutes for timeframe 1", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T00:10:00.000Z",
          1
        )
      ).toBe(10);
    });
    it("should return duration in minutes for timeframe 5", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T00:10:00.000Z",
          5
        )
      ).toBe(2);
    });
    it("should return duration in minutes for timeframe 15", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T01:00:00.000Z",
          15
        )
      ).toBe(4);
    });
    it("should return duration in hours for timeframe 60", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T01:00:00.000Z",
          60
        )
      ).toBe(1);
    });
    it("should return duration in hours for timeframe 120", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T06:00:00.000Z",
          120
        )
      ).toBe(3);
    });
    it("should return duration in hours for timeframe 240", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-01T06:00:00.000Z",
          240
        )
      ).toBe(1);
    });
    it("should return duration in days for timeframe 1440", () => {
      expect(
        Timeframe.durationTimeframe(
          "2018-01-01T00:00:00.000Z",
          "2018-01-02T06:00:00.000Z",
          1440
        )
      ).toBe(1);
    });
  });
  describe("Test 'getCurrentSince'", () => {
    beforeAll(() => {
      MockDate.set(new Date(Date.UTC(2019, 0, 1, 13, 17)));
    });

    afterAll(() => {
      MockDate.reset();
    });
    it("should return valid time for timeframe 1 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T13:17:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 1)).toBe(validSince);
    });
    it("should return valid time for timeframe 5 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T13:15:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 5)).toBe(validSince);
    });
    it("should return valid time for timeframe 15 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T13:15:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 15)).toBe(validSince);
    });
    it("should return valid time for timeframe 30 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T13:00:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 30)).toBe(validSince);
    });
    it("should return valid time for timeframe 60 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T13:00:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 60)).toBe(validSince);
    });
    it("should return valid time for timeframe 120 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T12:00:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 120)).toBe(validSince);
    });
    it("should return valid time for timeframe 240 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T12:00:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 240)).toBe(validSince);
    });
    it("should return valid time for timeframe 1440 and amount 1", () => {
      const validSince = dayjs.utc("2019-01-01T00:00:00.000Z").valueOf();
      expect(Timeframe.getCurrentSince(1, 1440)).toBe(validSince);
    });
  });
});