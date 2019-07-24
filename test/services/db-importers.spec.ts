import dotenv from "dotenv";
dotenv.config();
import { ServiceBroker } from "moleculer";
import TestService from "../../services/db/db-importers.service";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

jest.setTimeout(60000);

describe("Test 'db-importers' service", () => {
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'db-importers.upsert' action", () => {
    it("should upsert importers", async () => {
      const id = uuid();
      const result = await broker.call("db-importers.upsert", {
        entity: {
          id,
          exchange: "bitfinex",
          asset: "BTC",
          currency: "USD",
          params: {
            dateFrom: dayjs.utc().toISOString(),
            dateTo: dayjs.utc().toISOString()
          },
          status: "pending",
          startedAt: dayjs.utc().toISOString()
        }
      });
      expect(result).toBeTruthy();

      await broker.call("db-importers.remove", { id });
    });
  });
});
