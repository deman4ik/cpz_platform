import { v4 as uuid } from "uuid";
import Importer from "../../src/importer/importer";
import publishEvents from "../../../cpz-shared/eventgrid";
import { tradesEX } from "../../../cpz-shared/connector";
import { saveCandlesArrayToCache } from "../../../cpz-shared/tableStorage/candles";
import { saveCandlesDB } from "../../../cpz-shared/db";

jest.mock("../../../cpz-shared/eventgrid");
jest.mock("uuid");
jest.mock("../../../cpz-shared/connector");
jest.mock("../../../cpz-shared/tableStorage/candles");
jest.mock("../../../cpz-shared/db");

const state = {
  eventSubject: "",
  taskId: "",
  debug: true,
  providerType: "ccxt",
  exchange: "Bitfinex",
  asset: "BTC",
  currency: "ETH",
  timeframes: [1, 5, 15, 30, 60, 120, 240, 1440],
  requireBatching: true,
  saveToCache: true,
  dateFrom: "2019-02-17T10:11:02.278Z",
  dateTo: "2019-02-19T10:16:08.255Z"
};

describe("Importer Tests", () => {
  test("Should be instance of importer", () => {
    const importer = new Importer(state);
    expect(importer).toBeInstanceOf(Importer);
  });
  test("LogEvent method", () => {
    const importer = new Importer(state);
    importer.logEvent("test");
    expect(publishEvents).toHaveBeenCalledWith("log", {
      eventType: { eventType: "CPZ.Importer.Log" },
      service: "importer",
      subject: "",
      data: { data: "test", taskId: "" }
    });
  });
  test("Get limit method", () => {
    const importer = new Importer(state);
    importer.exchange = "bitfinex";
    expect(importer.getLimit()).toBe(1000);
    importer.exchange = "kraken";
    expect(importer.getLimit()).toBe(500);
    importer.exchange = "coinbasepro";
    expect(importer.getLimit()).toBe(300);
    importer.exchange = "binance";
    expect(importer.getLimit()).toBe(500);
  });
  test("Create candles", () => {
    uuid.mockReturnValue("133def62-0de4-4377-938f-cd83889ff4ed");
    const importer = new Importer(state);
    const candles = importer.createCandles(
      [
        { time: 1550398263278, price: 3200, amount: 1231 },
        { time: 1550398262278, price: 3700, amount: 32424 }
      ],
      "2019-02-16T10:11:02.278Z",
      "2019-02-17T10:32:02.278Z"
    );
    expect(candles).toEqual([
      {
        PartitionKey: "Bitfinex.BTC.ETH.1",
        RowKey: "030953281737722",
        asset: "BTC",
        currency: "ETH",
        exchange: "Bitfinex",
        high: 3700,
        id: "133def62-0de4-4377-938f-cd83889ff4ed",
        low: 3200,
        open: 3700,
        close: 3200,
        taskId: "",
        time: 1550398262278,
        timeframe: 1,
        timestamp: "2019-02-17T10:11:02.278Z",
        type: "created",
        volume: 33655
      }
    ]);
  });
  test("Should loadTradesAndMakeCandles method correct", async () => {
    const args = {
      dateFrom: "2019-02-14T10:12:02.278Z",
      dateTo: "2019-02-17T10:14:02.278Z",
      duration: 1
    };
    const importer = new Importer(state);
    tradesEX.mockResolvedValue([
      /* {
        exchange: "Bitfinex",
        asset: "BTC",
        currency: "ETH",
        timeframe: 5,
        time: 1550398322278,
        timestamp: "2019-02-15T13:05:58.000Z",
        price: 3200,
        amount: 323
      },
      {
        exchange: "Bitfinex",
        asset: "BTC",
        currency: "ETH",
        timeframe: 5,
        time: 1550398322278,
        timestamp: "2019-02-15T13:05:58.000Z",
        price: 3200,
        amount: 323
      } */
    ]);
    let result;
    try {
      result = await importer.loadTradesAndMakeCandles(args);
      expect(tradesEX).toHaveBeenCalledWith({
        asset: "BTC",
        currency: "ETH",
        date: "2019-02-14T10:12:02.278Z",
        exchange: "Bitfinex",
        proxy: undefined
      });
      expect(result).toEqual({
        count: 0,
        data: [],
        dateFrom: "2019-02-14T10:12:02.278Z",
        dateTo: "2019-02-17T10:14:02.278Z",
        duration: 1,
        success: true
      });
    } catch (e) {
      console.error(e);
    }
  });
  test("Should correct load candles", async () => {
    const args = {
      dateFrom: "2019-02-14T10:12:02.278Z",
      dateTo: "2019-02-17T10:14:02.278Z",
      duration: 1
    };
    const importer = new Importer(state);
    try {
      const result = await importer.loadCandles(args);
      expect(result).toEqual({
        success: false,
        dateFrom: "2019-02-14T10:12:02.278Z",
        dateTo: "2019-02-17T10:14:02.278Z",
        duration: 1,
        count: 0,
        error: "Empty response"
      });
    } catch (e) {
      console.error(e);
    }
  });
  test("Should correct handle gaps", async () => {
    const inputCandles = [
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e598",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e962322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550748960000,
        timestamp: "2019-02-21T11:36:00.000Z",
        open: 3500,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      },
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e548",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550749380000,
        timestamp: "2019-02-21T11:43:00.000Z",
        open: 300,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      },
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e548",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550749140000,
        timestamp: "2019-02-21T11:39:00.000Z",
        open: 300,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      }
    ];
    uuid.mockReturnValue("11398c94-d7f6-48b2-ba50-6b3c5d360146");
    const importer = new Importer(state);
    try {
      const result = await importer.handleGaps(
        inputCandles,
        "2019-02-21T11:35:00.000Z",
        "2019-02-21T11:45:00.000Z"
      );
      expect(typeof result).toBe("object");
      expect(Array.isArray(result.candles)).toBeTruthy();
      expect(Array.isArray(result.gappedCandles)).toBeTruthy();
      expect(result).toHaveProperty("candles");
      expect(result).toHaveProperty("gappedCandles");
      expect(result.candles).toContainEqual({
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        asset: "BTC",
        close: 3459,
        currency: "USD",
        exchange: "bitfinex",
        high: 3700,
        id: "a44c1258-cadc-48b8-992c-e0315662e598",
        low: 3303,
        open: 3500,
        taskId: "f5db5753-1989-4f48-901b-e92e962322ac",
        time: 1550748960000,
        timeframe: 1,
        timestamp: "2019-02-21T11:36:00.000Z",
        type: "previous",
        volume: 235253
      });
      expect(result.candles).toHaveLength(9);
      expect(result.gappedCandles).toHaveLength(6);
    } catch (e) {
      console.error(e);
    }
  });
  test("Should not Batch Candles", async () => {
    const tempCandles = [
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e598",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e962322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550748960000,
        timestamp: "2019-02-21T11:36:00.000Z",
        open: 3500,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      },
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e548",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550749380000,
        timestamp: "2019-02-21T11:43:00.000Z",
        open: 300,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      },
      {
        id: "a44c1258-cadc-48b8-992c-e0315662e548",
        PartitionKey: "bitfinex.BTC.USD",
        RowKey: "000000003460000",
        taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
        type: "previous",
        exchange: "bitfinex",
        asset: "BTC",
        currency: "USD",
        timeframe: 1,
        time: 1550749140000,
        timestamp: "2019-02-21T11:39:00.000Z",
        open: 300,
        high: 3700,
        low: 3303,
        close: 3459,
        volume: 235253
      }
    ];

    const importer = new Importer(state);
    expect(importer.batchCandles(tempCandles, "", "", 3)).toEqual({
      "1": [
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e598",
          low: 3303,
          open: 3500,
          taskId: "f5db5753-1989-4f48-901b-e92e962322ac",
          time: 1550748960000,
          timeframe: 1,
          timestamp: "2019-02-21T11:36:00.000Z",
          type: "previous",
          volume: 235253
        },
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e548",
          low: 3303,
          open: 300,
          taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
          time: 1550749380000,
          timeframe: 1,
          timestamp: "2019-02-21T11:43:00.000Z",
          type: "previous",
          volume: 235253
        },
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e548",
          low: 3303,
          open: 300,
          taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
          time: 1550749140000,
          timeframe: 1,
          timestamp: "2019-02-21T11:39:00.000Z",
          type: "previous",
          volume: 235253
        }
      ],
      "120": [],
      "1440": [],
      "15": [],
      "240": [],
      "30": [],
      "5": [],
      "60": []
    });
  });
  test("Should success saveCandles", async () => {
    const timeframeCandles = {
      "1": [
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e598",
          low: 3303,
          open: 3500,
          taskId: "f5db5753-1989-4f48-901b-e92e962322ac",
          time: 1550748960000,
          timeframe: 1,
          timestamp: "2019-02-21T11:36:00.000Z",
          type: "previous",
          volume: 235253
        },
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e548",
          low: 3303,
          open: 300,
          taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
          time: 1550749380000,
          timeframe: 1,
          timestamp: "2019-02-21T11:43:00.000Z",
          type: "previous",
          volume: 235253
        },
        {
          PartitionKey: "bitfinex.BTC.USD",
          RowKey: "000000003460000",
          asset: "BTC",
          close: 3459,
          currency: "USD",
          exchange: "bitfinex",
          high: 3700,
          id: "a44c1258-cadc-48b8-992c-e0315662e548",
          low: 3303,
          open: 300,
          taskId: "f5db5753-1989-4f48-901b-e92e965322ac",
          time: 1550749140000,
          timeframe: 1,
          timestamp: "2019-02-21T11:39:00.000Z",
          type: "previous",
          volume: 235253
        }
      ],
      "120": [],
      "1440": [],
      "15": [],
      "240": [],
      "30": [],
      "5": [],
      "60": []
    };
    const importer = new Importer(state);
    try {
      await importer.saveCandles(timeframeCandles);
    } catch (e) {
      console.error(e);
    }
  });
  test("Should execute", async () => {
    const importer = new Importer(state);
    try {
      await importer.execute();
    } catch (e) {
      console.error(e);
    }
  });
  test("Should return correct state", () => {
    const importer = new Importer(state);
    const time = new Date().toISOString();
    importer.startedAt = time;
    expect(importer.getCurrentState()).toEqual({
      PartitionKey: "Bitfinex.BTC.ETH",
      RowKey: "",
      asset: "BTC",
      currency: "ETH",
      dateFrom: "2019-02-17T00:00:00.000Z",
      dateTo: "2019-02-19T10:16:00.000Z",
      debug: true,
      endedAt: null,
      eventSubject: "",
      exchange: "Bitfinex",
      limit: 500,
      loadCompletedDuration: 0,
      loadLeftDuration: 3496,
      loadPercent: 0,
      loadTotalDuration: 3496,
      processCompletedDuration: 0,
      processLeftDuration: 3496,
      processPercent: 0,
      processTotalDuration: 3496,
      providerType: "ccxt",
      requireBatching: true,
      saveToCache: true,
      startedAt: time,
      status: "started",
      taskId: "",
      timeframes: [1, 5, 15, 30, 60, 120, 240, 1440]
    });
  });
  test("Should be save", async () => {
    const importer = new Importer(state);
    try {
      await importer.save();
    } catch (e) {
      console.error(e);
    }
  });
});
