import { v4 as uuid } from "uuid";
import CandleBatcher from "../../src/batcher/candlebatcher";
import { lastMinuteCandleEX } from "../../../cpz-shared/connector";
import { createCandlebatcherSlug } from "../../../cpz-shared/config/state";
import {
  deletePrevCachedTicksArray,
  getPrevCachedTicks
} from "../../../cpz-shared/tableStorage/ticks";

jest.mock("../../../cpz-shared/connector");
jest.mock("../../../cpz-shared/config/state");
jest.mock("uuid");
jest.mock("../../../cpz-shared/tableStorage/ticks");

const context = {};
const state = {
  eventSubject: "Bitfinex/BTC/ETH",
  taskId: "",
  providerType: "ccxt",
  exchange: "Bitfinex",
  asset: "BTC",
  currency: "ETH",
  timeframes: [1, 5, 15, 30, 60, 120, 240, 1440],
  settings: {},
  lastCandle: {},
  lastCandles: {},
  updateRequested: false,
  stopRequested: false,
  startedAt: undefined,
  metadata: ""
};

describe("CandleBatcher Tests", () => {
  test("Should be instance of CandleBatcher", () => {
    const candlebatcher = new CandleBatcher(context, state);
    expect(candlebatcher).toBeInstanceOf(CandleBatcher);
  });
  test("Should be return Slug", () => {
    const candlebatcher = new CandleBatcher(context, state);
    createCandlebatcherSlug.mockReturnValue("Bitfinex.BTC.ETH");
    expect(candlebatcher.slug).toBe("Bitfinex.BTC.ETH");
  });
  test("Should be return Status", () => {
    const candlebatcher = new CandleBatcher(context, state);
    const { status } = candlebatcher;
    expect(status).toBe("started");
  });
  test("Status should be STATUS_STOPPED", () => {
    const candlebatcher = new CandleBatcher(context, state);
    const now = new Date().getTime();
    candlebatcher.status = "stopped";
    expect(candlebatcher.status).toBe("stopped");
    expect(now - new Date(candlebatcher._endedAt).getTime()).toBeLessThan(1);
    expect(candlebatcher._endedAt).toMatch(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
    );
  });
  test("Status should be STATUS_PENDING", () => {
    const candlebatcher = new CandleBatcher(context, state);
    candlebatcher.status = "pending";
    expect(candlebatcher.status).toBe("pending");
  });
  test("Should be return correct updateRequested (FALSE)", () => {
    const candlebatcher = new CandleBatcher(context, state);
    expect(candlebatcher.updateRequested).toBeFalsy();
  });
  test("Should be return correct updateRequested (TRUE)", () => {
    const updatedState = Object.assign(state, { updateRequested: true });
    const candlebatcher = new CandleBatcher(context, updatedState);
    expect(candlebatcher.updateRequested).toBeTruthy();
  });
  test("Should be return correct log message (0)", () => {
    const candlebatcher = new CandleBatcher(context, state);
    const { debug } = candlebatcher._settings;
    const log = jest.fn((...args) => {
      if (debug) {
        return `Candlebatcher ${candlebatcher._eventSubject}:, ${args}`;
      }
      return 0;
    });
    expect(log("test1", "test2")).toBe(0);
  });
  test("Should be return correct error log message (0)", () => {
    const candlebatcher = new CandleBatcher(context, state);
    const logError = jest.fn(
      (...args) => `Candlebatcher ${candlebatcher._eventSubject}:, ${args}`
    );
    expect(logError("test1", "test2")).toBe(
      "Candlebatcher Bitfinex/BTC/ETH:, test1,test2"
    );
  });
  test("Correct setting new value", async () => {
    const candlebatcher = new CandleBatcher(context, state);
    try {
      candlebatcher.setUpdate({
        debug: true,
        proxy: "url",
        requiredHistoryMaxBars: 15
      });
      expect(candlebatcher._settings).toEqual({
        debug: true,
        proxy: "url",
        requiredHistoryMaxBars: 15
      });
    } catch (e) {
      console.error(e);
    }
  });
  test("Correct load candle", async () => {
    try {
      const candlebatcher = new CandleBatcher(context, state);
      const lastMinuteCandleEXResult = {
        exchange: "Bitfinex",
        asset: "BTC",
        currency: "ETH",
        timeframe: 1,
        time: 1550235958000,
        timestamp: "2019-02-15T13:05:58.000Z",
        open: 3500,
        high: 3700,
        low: 3900,
        close: 3650,
        volume: 32434
      };
      lastMinuteCandleEX.mockResolvedValue(lastMinuteCandleEXResult);
      uuid.mockReturnValue("7acf35d2-9222-4d9c-89ee-cbe77c7fbeef");
      await candlebatcher._loadCandle();
      expect(candlebatcher._loadedCandle).toEqual({
        ...lastMinuteCandleEXResult,
        PartitionKey: undefined,
        RowKey: "030953444042000",
        id: "7acf35d2-9222-4d9c-89ee-cbe77c7fbeef",
        taskId: "",
        type: "loaded"
      });
    } catch (e) {
      console.error(e);
    }
  });
  test("Incorrect load candle", async () => {
    try {
      const candlebatcher = new CandleBatcher(context, state);
      await candlebatcher._loadCandle();
    } catch (e) {
      expect(e.message).toBe(
        "Failed to load candle: Cannot read property 'time' of undefined"
      );
    }
  });

  describe("Correct createCandle method", () => {
    test("Create candle ", async () => {
      const tick1 = {
        type: "tick",
        tickId: "",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "tickId",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        direction: "BUY",
        tradeId: "",
        time: 12,
        timestamp: "121",
        volume: 12312,
        price: 1231
      };
      try {
        getPrevCachedTicks.mockResolvedValue([tick1]);
        const candlebatcher = new CandleBatcher(context, state);
        await candlebatcher._createCandle();
        expect(candlebatcher._createdCandle).toBeNull();
      } catch (e) {
        console.log(e.message);
      }
    });
  });
  describe("Clear Ticks", () => {
    test("Clear ticks ", async () => {
      try {
        const candlebatcher = new CandleBatcher(context, state);
        candlebatcher._ticks = Array(2);
        deletePrevCachedTicksArray.mockResolvedValue(true);
        await candlebatcher._clearTicks();
        expect(deletePrevCachedTicksArray).toHaveBeenCalled();
      } catch (e) {
        console.error(e);
      }
    });
    test("Clear ticks not run ", async () => {
      try {
        const candlebatcher = new CandleBatcher(context, state);
        candlebatcher._ticks = Array(0);
        deletePrevCachedTicksArray.mockResolvedValue(true);
        await candlebatcher._clearTicks();
        expect(deletePrevCachedTicksArray).not.toHaveBeenCalled();
      } catch (e) {
        console.error(e);
      }
    });
    test("Clear ticks except Error", async () => {
      try {
        const candlebatcher = new CandleBatcher(context, state);
        deletePrevCachedTicksArray.mockRejectedValue(new Error());
        await candlebatcher._clearTicks();
      } catch (e) {
        console.error(e);
      }
    });
  });
  describe("Current state", () => {
    test("Should return current state", () => {
      const candlebatcher = new CandleBatcher(context, state);
      expect(candlebatcher.getCurrentState()).toEqual({
        RowKey: "",
        asset: "BTC",
        currency: "ETH",
        endedAt: "",
        eventSubject: "Bitfinex/BTC/ETH",
        exchange: "Bitfinex",
        lastCandle: {},
        metadata: "",
        providerType: "ccxt",
        sendedCandles: [],
        settings: {
          debug: false,
          requiredHistoryMaxBars: 30
        },
        startedAt: candlebatcher._startedAt,
        status: "started",
        taskId: "",
        timeframes: [1, 5, 15, 30, 60, 120, 240, 1440]
      });
    });
  });
});
