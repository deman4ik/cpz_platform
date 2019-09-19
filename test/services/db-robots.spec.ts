import dotenv from "dotenv";
dotenv.config();
import { ServiceBroker } from "moleculer";
import TestService from "../../services/db/robot/db-robots.service";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";
import { cpz } from "../../types/cpz";
import { Op } from "sequelize";

jest.setTimeout(60000);

describe("Test 'db-robots' service", () => {
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'db-robots.find' action", () => {
    it("should return robots", async () => {
      const robots = await broker.call(`db-robots.findActive`, {
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1
      });
      expect(robots.length).toBe(0);
    });
  });
});