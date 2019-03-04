import Provider from "../../src/providers/basePublicProvider";

describe("Base Public Provider tests", () => {
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
        }
      }
    }
  };
  test("Should be instanceof basePublicProvider", () => {
    const provider = new Provider(input);
    expect(provider).toBeInstanceOf(Provider);
  });

  test("Method getMarket should return throw", async () => {
    const provider = new Provider(input);
    try {
      const getMarket = await provider.getMarket();
      expect(getMarket).toThrow("NotImlementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method loadPreviousCandle should return throw", async () => {
    const provider = new Provider(input);
    try {
      const loadPreviousCandle = await provider.loadPreviousCandle();
      expect(loadPreviousCandle).toThrow("NotImlementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method loadCandles should return throw", async () => {
    const provider = new Provider(input);
    try {
      const loadCandles = await provider.loadCandles();
      expect(loadCandles).toThrow("NotImlementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method loadTrades should return throw", async () => {
    const provider = new Provider(input);
    try {
      const loadTrades = await provider.loadTrades();
      expect(loadTrades).toThrow("NotImlementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
