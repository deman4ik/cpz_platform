import dotenv from "dotenv";
import { ServiceBroker, Errors } from "moleculer";
import TestService from "../../services/data/market-data.service";
import { candles60 } from "../utils/candles";
import { v4 as uuid } from "uuid";

describe("Test 'market-data' service", () => {
  dotenv.config();
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'market-data.saveCandles' action", () => {
    it("should save 60 timeframe candles", async () => {
      const candles = candles60.map(candle => ({ ...candle, id: uuid() }));
      const result = await broker.call("market-data.saveCandles", {
        timeframe: 60,
        candles
      });
      expect(result).toBeTruthy();
    });
  });
});
