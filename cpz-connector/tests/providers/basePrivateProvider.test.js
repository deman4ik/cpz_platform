import { getSecret, decrypt } from "cpzKeyVault";
import Provider from "../../src/providers/basePrivateProvider";

jest.mock("cpzKeyVault");

describe("Base Private Provider tests", () => {
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
  const context = {
    log: () => true
  };

  test("Should be instanceof basePrivateProvider", () => {
    const provider = new Provider(input);
    expect(provider).toBeInstanceOf(Provider);
  });

  test("Method loadAndDecrypt should be correct return", async () => {
    const provider = new Provider(input);
    getSecret.mockResolvedValue("");
    decrypt.mockResolvedValue("");
    try {
      await provider._loadAndDecrypt(context, "main", "APIKey");
      expect(getSecret.mock.calls[0][0]).toEqual({
        uri: undefined,
        clientId: undefined,
        appSecret: undefined,
        secretName: null,
        secretVersion: null
      });
      expect(provider._keys.main.APIKey).toBeTruthy();
    } catch (e) {
      expect(e).toBeNull();
    }
  });

  test("Method loadAndDecrypt should be throw return", async () => {
    const provider = new Provider(input);
    try {
      expect(await provider._loadAndDecrypt(context, "", "APIKey")).toThrow();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method _loadKeys should be correct return", async () => {
    const provider = new Provider(input);
    try {
      await provider._loadKeys(context, "main");
    } catch (e) {
      expect(e).toBeNull();
    }
  });

  test("Method _loadKeys should be throw return", async () => {
    const provider = new Provider(input);
    try {
      expect(await provider._loadKeys(context, "")).toThrow();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method getBalance should return throw", async () => {
    const provider = new Provider(input);
    try {
      const balance = await provider.getBalance();
      expect(balance).toThrow("NotImplementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  test("Method createOrder should return throw", async () => {
    const provider = new Provider(input);
    try {
      const createOrder = await provider.createOrder();
      expect(createOrder).toThrow("NotImplementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
  test("Method checkOrder should return throw", async () => {
    const provider = new Provider(input);
    try {
      const checkOrder = await provider.checkOrder();
      expect(checkOrder).toThrow("NotImplementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
  test("Method cancelOrder should return throw", async () => {
    const provider = new Provider(input);
    try {
      const cancelOrder = await provider.cancelOrder();
      expect(cancelOrder).toThrow("NotImplementedError");
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
