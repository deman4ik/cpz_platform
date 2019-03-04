import pretry from "p-retry";
import { correctWithLimit, precision } from "cpzUtils/helpers";
import Provider from "../../src/providers/ccxtPrivateProvider";

// Mock internal modules
jest.mock("cpzUtils/helpers");
jest.mock("p-retry");

describe("CCXT Private Provider tests", () => {
  const input = {
    exchange: "Bitfinex",
    userId: "123",
    proxy: false,
    keys: {
      main: {
        specified: false,
        loaded: false,
        active: true,
        APIKey: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        },
        APISecret: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        }
      },
      spare: {
        specified: false,
        loaded: false,
        active: false,
        APIKey: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        },
        APISecret: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        }
      }
    }
  };
  const context = {
    log: jest.fn(args => args)
  };
  // Add mock methods to context.log
  Object.assign(context.log, {
    info: jest.fn(args => args),
    warn: jest.fn(args => args),
    error: jest.fn(args => args)
  });

  test("Should be instanceof ccxtPrivateProvider", () => {
    const provider = new Provider(input);
    expect(provider).toBeInstanceOf(Provider);
  });

  test("Should be correct init method with name", async () => {
    const provider = new Provider(input);
    try {
      provider._loadKeys = jest.fn();
      await provider.init(context);
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  test("Should be correct init method with another arg", async () => {
    const provider = new Provider(input);
    try {
      provider._loadKeys = jest.fn();
      await provider.init(context, "spare");
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  test("Should be correct _checkKeysVersion method (main)", async () => {
    const provider = new Provider(input);
    const initSpy = jest.spyOn(provider, "init").mockImplementation(() => true);
    const _setKeysSpy = jest
      .spyOn(provider, "_setKeys")
      .mockImplementation(() => true);
    try {
      await provider._checkKeysVersion(context, {
        main: {
          APIKey: { name: "test" },
          APISecret: { name: "test" }
        }
      });
      expect(initSpy).toHaveBeenCalledWith(context, "main");
      expect(_setKeysSpy).toHaveBeenCalledWith({
        main: {
          APIKey: { name: "test" },
          APISecret: { name: "test" }
        }
      });
    } catch (e) {
      console.log(e);
      expect(e).toBeUndefined();
    }
  });

  test("Should be correct _checkKeysVersion method (spare)", async () => {
    const provider = new Provider(input);
    jest.spyOn(provider, "init").mockImplementation(() => true);
    const _setKeysSpy = jest
      .spyOn(provider, "_setKeys")
      .mockImplementation(() => true);
    await provider._checkKeysVersion(context, {
      spare: {
        APIKey: { name: "test" },
        APISecret: { name: "test" }
      }
    });
    expect(_setKeysSpy).toHaveBeenCalledWith({
      spare: {
        APIKey: { name: "test" },
        APISecret: { name: "test" }
      }
    });
  });

  // TODO Not Working now error "TypeError: Cannot read property 'indexOf' of undefined". To find solution
  /* describe("_handleExchangeError method", () => {
    test("Should be correct error with e instanceof ccxt.ExchangeError", async () => {
      const updatedInput = { ...input };
      updatedInput.keys.main.active = true;
      updatedInput.keys.spare.specified = true;
      const provider = new Provider(updatedInput);
      provider.init = await jest.fn();
      const error = new ccxt.ExchangeError("error");
      await provider._handleExchangeError(context, error);
      // expect(init).toHaveBeenCalledWith(context, "spare");
    });
  }); */

  test("Should correct working clearOrderCache method", () => {
    const provider = new Provider(input);
    provider.ccxt = {
      milliseconds: jest.fn().mockReturnValue(10),
      purgeCachedOrders: jest.fn()
    };
    provider.clearOrderCache();
    expect(provider.ccxt.milliseconds).toHaveBeenCalled();
    expect(provider.ccxt.purgeCachedOrders).toHaveBeenCalledWith(-86399990);
  });

  test("Should correct get symbol method", () => {
    const provider = new Provider(input);
    expect(provider.getSymbol("BTC", "ETH")).toBe("BTC/ETH");
  });

  test("Should correct get balance method", async () => {
    expect.assertions(3);
    const provider = new Provider(input);
    const response = {
      free: 10,
      used: 15,
      total: 20
    };
    const keys = { keys: null };
    provider._checkKeysVersion = jest.fn().mockResolvedValue(true);
    provider._handleExchangeError = jest.fn().mockResolvedValue(true);
    provider.ccxt.fetchBalance = jest.fn().mockResolvedValue(response);
    pretry.mockResolvedValue(response);
    expect(await provider.getBalance(context, keys)).toStrictEqual({
      success: true,
      balance: response
    });
    expect(await provider._checkKeysVersion).toHaveBeenCalledWith(
      context,
      keys
    );
    // expect(provider.ccxt.fetchBalance).toHaveBeenCalled();
    expect(await provider._handleExchangeError).not.toHaveBeenCalled();
    // TODO Find solution for expect below
    // expect(await pretry).toHaveReturnedWith(response);
  });

  test("Should throw get balance method", async () => {
    expect.assertions(1);
    const provider = new Provider(input);
    const keys = { keys: null };
    Object.assign(context.log, { error: jest.fn() });
    provider._checkKeysVersion = jest.fn().mockRejectedValue("error");
    expect(await provider.getBalance(context, keys)).toStrictEqual({
      error: { message: undefined, name: "String" },
      success: false
    });
  });

  describe("Should correcr return getOrderParam ", () => {
    test("Should correct return getOrderParams method for kraken", () => {
      const updatedInput = { ...input };
      updatedInput.exchange = "kraken";
      const provider = new Provider(updatedInput);
      expect(provider.getOrderParams()).toStrictEqual({
        leverage: 3
      });
    });

    test("Should correct return getOrderParams method for bitfinex", () => {
      const updatedInput = { ...input };
      updatedInput.exchange = "bitfinex";
      const provider = new Provider(updatedInput);
      expect(provider.getOrderParams()).toStrictEqual({
        type: "limit"
      });
    });

    test("Should correct return getOrderParams method for another", () => {
      const updatedInput = { ...input };
      updatedInput.exchange = "test";
      const provider = new Provider(updatedInput);
      expect(provider.getOrderParams()).toStrictEqual({});
    });
  });

  describe("getCloseOrderDate method tests", () => {
    test("kraken exchange test", () => {
      const updatedInput = { ...input };
      updatedInput.exchange = "kraken";
      const orderResponse = {
        info: {
          closetm: 1549988360
        }
      };
      const provider = new Provider(updatedInput);
      expect(provider.getCloseOrderDate(orderResponse)).toBe(
        "2019-02-12T16:19:20.000Z"
      );
    });

    test("another exchange test", () => {
      const updatedInput = { ...input };
      updatedInput.exchange = "another";
      const orderResponse = {
        lastTradeTimestamp: 1549988360000
      };
      const provider = new Provider(updatedInput);
      expect(provider.getCloseOrderDate(orderResponse)).toBe(
        "2019-02-12T16:19:20.000Z"
      );
    });
  });

  describe("CreateOrder method", () => {
    const provider = new Provider(input);
    const keys = {};
    const order = {
      direction: "long",
      volume: 1241,
      price: 2343,
      asset: "BTC",
      currency: "ETH",
      orderType: "market",
      params: {}
    };

    // Mocking provider methods
    Object.assign(provider, {
      getSymbol: jest.fn(),
      ccxt: {
        market: jest.fn()
      },
      clearOrderCache: jest.fn(),
      _checkKeysVersion: jest.fn()
    });

    // Clear mocks before each test
    beforeEach(() => jest.clearAllMocks());

    test("Should correct createOrder method", async () => {
      // Setup mocks for modules result
      pretry.mockReturnValue(true);

      // Setup mocks for provider methods
      provider.ccxt.market.mockReturnValue({
        precision: { amount: 8, price: 1 },
        limits: {
          amount: { min: 0.002, max: 100000000 },
          price: { min: 0.1, max: undefined },
          cost: { min: 0, max: undefined }
        }
      });
      provider.getSymbol.mockReturnValue("BTC/ETH");
      precision.mockReturnValueOnce(2343).mockReturnValueOnce(1241);

      // Expectations
      expect(await provider.createOrder(context, {}, order)).toStrictEqual({
        order: {
          average: undefined,
          exId: undefined,
          exLastTrade: undefined,
          exTimestamp: undefined,
          executed: NaN,
          price: undefined,
          remaining: undefined,
          status: undefined,
          volume: undefined
        },
        success: true
      });
      //
      expect(context.log).toHaveBeenCalledWith("createOrder()");
      expect(provider._checkKeysVersion).toHaveBeenCalledWith(context, keys);
      expect(provider.getSymbol).toHaveBeenCalledWith("BTC", "ETH");
      expect(provider.ccxt.market).toHaveBeenCalledWith("BTC/ETH");
      expect(correctWithLimit.mock.calls).toEqual([
        [2343, 0.1, undefined],
        [1241, 0.002, 100000000]
      ]);
      expect(precision.mock.calls).toEqual([[2343, 1], [1241, 8]]);
    });
  });

  describe("Check Order method", () => {
    const provider = new Provider(input);
    const keys = {};
    const exId = "OEKMRS-3G2VL-OEUP2B";
    const asset = "BTC";
    const currency = "ETH";

    Object.assign(provider, {
      ccxt: {
        fetchOrder: jest.fn().mockResolvedValue({
          id: "OEKMRS-3G2VL-OEUP2B",
          datetime: "2018-12-21T15:18:50.760Z",
          status: "open",
          price: 3500,
          average: 0,
          amount: 1000,
          remaining: 1000,
          filled: 500
        })
      },
      _checkKeysVersion: jest.fn().mockReturnValue("true")
    });

    test("Correct return", async () => {
      pretry.mockResolvedValue({
        id: "OEKMRS-3G2VL-OEUP2B",
        datetime: "2018-12-21T15:18:50.760Z",
        status: "open",
        price: 3500,
        average: 0,
        amount: 1000,
        remaining: 1000,
        filled: 500
      });
      expect(
        await provider.checkOrder(context, keys, { exId, asset, currency })
      ).toStrictEqual({
        order: {
          average: 0,
          exId: "OEKMRS-3G2VL-OEUP2B",
          exLastTrade: undefined,
          exTimestamp: "2018-12-21T15:18:50.760Z",
          executed: 500,
          price: 3500,
          remaining: 1000,
          status: "open",
          volume: 1000
        },
        success: true
      });
    });

    test("Return throw", async () => {
      expect(
        await provider.checkOrder(context, keys, { exId, asset, currency })
      ).toStrictEqual({
        error: {
          message: "Cannot read property 'id' of undefined",
          name: "TypeError"
        },
        success: false
      });
    });
  });

  describe("cancelOrder method", () => {
    const provider = new Provider(input);
    const keys = {};
    const exId = "OEKMRS-3G2VL-OEUP2B";
    const asset = "BTC";
    const currency = "ETH";
    Object.assign(provider, {
      checkOrder: jest.fn().mockResolvedValue({})
    });
    test("Error return", async () => {
      expect(
        await provider.cancelOrder(context, keys, { exId, asset, currency })
      ).toStrictEqual({
        error: undefined,
        success: true
      });
    });
    test("Correct return", () => {});
  });
});
