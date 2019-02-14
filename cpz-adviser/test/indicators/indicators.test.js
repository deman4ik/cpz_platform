import EMA from "../../src/indicators/EMA";
import SMA_CACHE from "../../src/indicators/SMA_CACHE";

/*
 * Можно для правильности добавить в индикатор только get методы,
 * Чтобы не было Error: Property calc does not have access type get
 */

describe("EMA Tests", () => {
  const ema = EMA;
  test("Should be Object type", () => {
    expect(typeof ema).toBe("object");
  });
  test("Should have at least init and calc prop", () => {
    const ownMethods = Object.getOwnPropertyNames(ema);
    expect(ownMethods).toEqual(["init", "calc"]);
  });
  test("Should have init method", () => {
    expect(typeof ema.init).toBe("function");
  });
  test("Should have calc method", () => {
    expect(typeof ema.calc).toBe("function");
  });
});

describe("SMA_CACHE Tests", () => {
  const smaCache = SMA_CACHE;
  test("Should be Object type", () => {
    expect(typeof smaCache).toBe("object");
  });
  test("Should have at least init and calc prop", () => {
    const ownMethods = Object.getOwnPropertyNames(smaCache);
    expect(ownMethods).toEqual(["init", "calc"]);
  });
  test("Should have init method", () => {
    expect(typeof smaCache.init).toBe("function");
  });
  test("Should have calc method", () => {
    expect(typeof smaCache.calc).toBe("function");
  });
});
