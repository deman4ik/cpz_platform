import dotenv from "dotenv";
import { ServiceBroker, Errors } from "moleculer";
import dayjs from "../../lib/dayjs";
import TestService from "../../services/exconnector.service";

describe("Test 'exconnector' service", () => {
  dotenv.config();
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'exconnector.getCandles' action", () => {
    it("should return array of candles", async () => {
      const result = await broker.call("exconnector.getCandles", {
        exchange: "bitfinex",
        asset: "BCH",
        currency: "USD",
        timeframe: 120,
        dateFrom: dayjs.utc("2019-07-03 16:00:00").toISOString(),
        limit: 10
      });
      console.log(result);
      console.log("first", result[0].timestamp);
      console.log("last", result[result.length - 1].timestamp);
      expect(Array.isArray(result)).toBe(true);
    });
    /*it("should return array of candles", async () => {
      const result = await broker.call("exconnector.getCandles", {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 1440,
        dateFrom: dayjs.utc("2018-01-01").toISOString(),
        limit: 500
      });
      console.log(result.length);
      console.log("first", result[0].timestamp);
      console.log("last", result[result.length - 1].timestamp);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        asset: "BTC",
        close: 13506.1,
        currency: "USD",
        exchange: "kraken",
        high: 14442.9,
        low: 13050,
        open: 13971.1,
        time: 1514764800000,
        timeframe: 1440,
        timestamp: "2018-01-01T00:00:00.000Z",
        type: "loaded",
        volume: 2226.37250671
      });
    });*/
  });
});
