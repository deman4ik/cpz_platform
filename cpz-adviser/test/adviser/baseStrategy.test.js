import BaseStrategy from "../../src/adviser/baseStrategy";

const state = {
  name: "SMA",
  parameters: {},
  indicatorName: "SMA1",
  initialized: false,
  exchange: "Bitfinex",
  positions: {},
  advice: "",
  asset: "BTC",
  currency: "ETH",
  timeframe: 15,
  options: {},
  tulipIndicators: {},
  log: () => {},
  logEvent: () => {},
  variables: {},
  indicatorFunctions: {}
};

describe("BaseStrategy", () => {
  test("Should be instanceof BaseStrategy", () => {
    expect(new BaseStrategy(state)).toBeInstanceOf(BaseStrategy);
  });
  test("Should be correct constructor", () => {
    const baseStrategy = new BaseStrategy(state);
    expect(baseStrategy._name).toBe("SMA");
    expect(baseStrategy.parameters).toEqual({});
    expect(baseStrategy._indicatorName).toBe("SMA1");
    expect(baseStrategy._initialized).toBeFalsy();
    expect(baseStrategy._exchange).toBe("Bitfinex");
    expect(baseStrategy._asset).toBe("BTC");
    expect(baseStrategy._currency).toBe("ETH");
    expect(baseStrategy._timeframe).toBe(15);
    expect(typeof baseStrategy._options).toBe("object");
    expect(typeof baseStrategy._tulipIndicators).toBe("object");
    expect(typeof baseStrategy._log).toBe("function");
    expect(typeof baseStrategy._logEvent).toBe("function");
  });
  test("Should have empty methods init(), calc() ", () => {
    const baseStrategy = new BaseStrategy(state);
    expect(baseStrategy.calc()).toBeUndefined();
    expect(baseStrategy.init()).toBeUndefined();
  });
  // Bug in IDE https://youtrack.jetbrains.com/issue/WEB-37021
  // TODO Improve test ASAP
  /* test("Should be correct result of done()", async () => {
    const baseStrategy = new BaseStrategy(state);
    const result = await baseStrategy.done();
    expect(result).toEqual({});
  }); */

  /*
   * Возможно отправить не все данные и тогда все будет undefined
   * возможно сделать свойства по умолчанию?
   */

  test("Should be correct add to this", () => {
    const baseStrategy = new BaseStrategy(state);
    baseStrategy._handleCandle(
      {
        open: 3500,
        high: 3700,
        low: 2345,
        close: 3244,
        volume: 2345223
      },
      [
        {
          open: 3500,
          high: 3700,
          low: 2345,
          close: 3244,
          volume: 2345223
        },
        {
          open: 3500,
          high: 373500,
          low: 2345,
          close: 3244,
          volume: 2345223
        },
        {
          open: 23423,
          high: 3700,
          low: 2234345,
          close: 3244,
          volume: 2345223
        }
      ],
      {
        prop1: 1,
        prop2: 2
      }
    );
    expect(baseStrategy._candle).toEqual({
      open: 3500,
      high: 3700,
      low: 2345,
      close: 3244,
      volume: 2345223
    });
    expect(baseStrategy._candles.length).toBe(3);
    expect(baseStrategy._candles).toContainEqual({
      open: 23423,
      high: 3700,
      low: 2234345,
      close: 3244,
      volume: 2345223
    });
    expect(baseStrategy._candlesProps).toEqual({
      prop1: 1,
      prop2: 2
    });
  });
  test("Should be correct get for method handleCandle", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "handleCandle", "get");
    const { handleCandle } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(typeof handleCandle).toBe("function");
    spy.mockRestore();
  });
  test("Should be correct get for method initialized", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "initialized", "get");
    const { initialized } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(initialized).toBeFalsy();
    spy.mockRestore();
  });
  test("Should be correct set for method initialized", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "initialized", "set");
    baseStrategy.initialized = true;
    expect(spy).toHaveBeenCalled();
    expect(baseStrategy.initialized).toBeTruthy();
    spy.mockRestore();
  });

  test("Should be correct get for method options", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "options", "get");
    const { options } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(options).toEqual({});
    spy.mockRestore();
  });
  test("Should be correct get for method exchange", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "exchange", "get");
    const { exchange } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(exchange).toBe("Bitfinex");
    spy.mockRestore();
  });
  test("Should be correct get for method asset", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "asset", "get");
    const { asset } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(asset).toBe("BTC");
    spy.mockRestore();
  });
  test("Should be correct get for method currency", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "currency", "get");
    const { currency } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(currency).toBe("ETH");
    spy.mockRestore();
  });
  test("Should be correct get for method timeframe", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "timeframe", "get");
    const { timeframe } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(timeframe).toBe(15);
    spy.mockRestore();
  });
  test("Should be correct get for method candle", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "candle", "get");
    const { candle } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(candle).toBeNull();
    spy.mockRestore();
  });
  test("Should be correct get for method candles", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "candles", "get");
    const { candles } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(candles).toEqual([]);
    spy.mockRestore();
  });
  test("Should be correct get for method candlesProps", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "candlesProps", "get");
    const { candlesProps } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(candlesProps).toEqual({
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    });
    spy.mockRestore();
  });
  test("Should be correct get for method log", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "log", "get");
    const { log } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(typeof log).toBe("function");
    spy.mockRestore();
  });
  test("Should be correct get for method logEvent", () => {
    const baseStrategy = new BaseStrategy(state);
    const spy = jest.spyOn(BaseStrategy, "logEvent", "get");
    const { logEvent } = BaseStrategy;
    expect(spy).toHaveBeenCalled();
    expect(typeof logEvent).toBe("function");
    spy.mockRestore();
  });
});
