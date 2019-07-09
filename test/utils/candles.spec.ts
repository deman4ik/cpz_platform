import { handleCandleGaps } from "../../utils/candles";
import dayjs from "../../lib/dayjs";
import { cpz } from "../../types/cpz";
import { candles1, candles60 } from "./gappedCandles";

describe("Test 'candles' utils", () => {
  describe("Test 'handleGaps'", () => {
    it("Schould fill gaps in candles - timeframe 1", () => {
      const dateFrom = dayjs.utc("2019-07-03T15:40:00.000Z");
      const dateTo = dayjs.utc("2019-07-03T15:50:00.000Z");
      const result = handleCandleGaps(
        dateFrom.toISOString(),
        dateTo.toISOString(),
        candles1
      );
      expect(result[0].timestamp).toBe(dateFrom.toISOString());
      expect(result[0].type).toBe(cpz.CandleType.previous);
      expect(result[result.length - 1].timestamp).toBe(dateTo.toISOString());
    });
    it("Schould fill gaps in candles - timeframe 60", () => {
      const dateFrom = dayjs.utc("2019-07-03T15:00:00.000Z");
      const dateTo = dayjs.utc("2019-07-04T02:00:00.000Z");
      const result = handleCandleGaps(
        dateFrom.toISOString(),
        dateTo.toISOString(),
        candles60
      );
      expect(result[0].timestamp).toBe(dateFrom.toISOString());
      expect(result[result.length - 1].timestamp).toBe(
        "2019-07-04T01:00:00.000Z"
      );
      expect(result[result.length - 1].type).toBe(cpz.CandleType.previous);
    });
  });
});
