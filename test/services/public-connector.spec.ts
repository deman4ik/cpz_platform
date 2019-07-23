import dotenv from "dotenv";
import { ServiceBroker, Errors } from "moleculer";
import dayjs from "../../lib/dayjs";
import TestService from "../../services/connector/public-connector.service";
jest.setTimeout(60000);
describe("Test 'public-connector' service", () => {
  dotenv.config();
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'public-connector.getCandles' action", () => {
    it("should return array of candles", async () => {
      const result = await broker.call("public-connector.getCandles", {
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 120,
        dateFrom: dayjs.utc("2019-07-01T00:00:00.000Z").toISOString(),
        limit: 100
      });
      //ERROR importer/IMPORTER-WORKER: bitfinex.BTC.USD.240 2019-07-01T00:00:00.000Z empty response!
      //ERROR importer/IMPORTER-WORKER: bitfinex.BTC.USD.120 2019-07-01T00:00:00.000Z empty response!
      console.log(result);
      if (result && Array.isArray(result) && result.length > 0) {
        console.log("first", result[0].timestamp);
        console.log("last", result[result.length - 1].timestamp);
      }
      expect(Array.isArray(result)).toBe(true);
    });
    /*it("should return array of candles", async () => {
      const result = await broker.call("public-connector.getCandles", {
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
