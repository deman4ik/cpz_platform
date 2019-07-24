import dotenv from "dotenv";
dotenv.config();
import { ServiceBroker, Errors } from "moleculer";
import TestService from "../../services/db/candles/db-candles60.service";
import { candles60 } from "../testData/candles";
import { v4 as uuid } from "uuid";

jest.setTimeout(60000);

describe("Test 'candles60' service", () => {
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'candles60.upsert' action", () => {
    it("should insert candles", async () => {
      const candles = [
        { ...candles60[0], id: uuid() },
        { ...candles60[1], id: uuid() }
      ];
      const result = await broker.call("candles60.upsert", {
        entities: candles
      });
      expect(result).toBeTruthy();
    });
  });
});
