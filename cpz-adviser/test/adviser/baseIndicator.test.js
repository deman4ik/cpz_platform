import BaseIndicator from "../../src/adviser/baseIndicator";

const state = {
  name: "SMA",
  indicatorName: "SMA1",
  initialized: false,
  exchange: "Bitfinex",
  asset: "BTC",
  currency: "ETH",
  timeframe: 15,
  options: {},
  tulipIndicators: {},
  log: () => {
  },
  logEvent: () => {
  },
  variables: {},
  indicatorFunctions: {}
};

describe("BaseIndicator", () => {
  test("Should be instanceof BaseIndicator", () => {
    expect(new BaseIndicator(state)).toBeInstanceOf(BaseIndicator);
  });
  test("Should be correct constructor", () => {
    const baseIndicator = new BaseIndicator(state);
    expect(baseIndicator._name).toBe("SMA");
    expect(baseIndicator._indicatorName).toBe("SMA1");
    expect(baseIndicator._initialized).toBeFalsy();
    expect(baseIndicator._exchange).toBe("Bitfinex");
    expect(baseIndicator._asset).toBe("BTC");
    expect(baseIndicator._currency).toBe("ETH");
    expect(baseIndicator._timeframe).toBe(15);
    expect(typeof baseIndicator._options).toBe("object");
    expect(typeof baseIndicator._tulipIndicators).toBe("object");
    expect(typeof baseIndicator._log).toBe("function");
    expect(typeof baseIndicator._logEvent).toBe("function");
  });
  test("Should have empty methods init(), calc() ", () => {
    const baseIndicator = new BaseIndicator(state);
    expect(baseIndicator.calc()).toBeUndefined();
    expect(baseIndicator.init()).toBeUndefined();
  });
  // Bug in IDE https://youtrack.jetbrains.com/issue/WEB-37021
  // TODO Improve test ASAP
  /* test("Should be correct result of done()", async () => {
    const baseIndicator = new BaseIndicator(state);
    const result = await baseIndicator.done();
    expect(result).toEqual({});
  }); */

  /*
   * Возможно отправить не все данные и тогда все будет undefined
   * возможно сделать свойства по умолчанию?
   */

  test("Should be correct add to this", () => {
    const baseIndicator = new BaseIndicator(state);
    baseIndicator._handleCandle(
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
    expect(baseIndicator._candle).toEqual({
      open: 3500,
      high: 3700,
      low: 2345,
      close: 3244,
      volume: 2345223
    });
    expect(baseIndicator._candles.length).toBe(3);
    expect(baseIndicator._candles).toContainEqual({
      open: 23423,
      high: 3700,
      low: 2234345,
      close: 3244,
      volume: 2345223
    });
    expect(baseIndicator._candlesProps).toEqual({
      prop1: 1,
      prop2: 2
    });
  });
  test("Should be correct get for method handleCandle", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "handleCandle", "get");
    const { handleCandle } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(typeof handleCandle).toBe("function");
    spy.mockRestore();
  });
  test("Should be correct get for method initialized", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "initialized", "get");
    const { initialized } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(initialized).toBeFalsy();
    spy.mockRestore();
  });
  test("Should be correct set for method initialized", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "initialized", "set");
    baseIndicator.initialized = true;
    expect(spy).toHaveBeenCalled();
    expect(baseIndicator.initialized).toBeTruthy();
    spy.mockRestore();
  });

  test("Should be correct get for method options", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "options", "get");
    const { options } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(options).toEqual({});
    spy.mockRestore();
  });
  test("Should be correct get for method exchange", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "exchange", "get");
    const { exchange } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(exchange).toBe("Bitfinex");
    spy.mockRestore();
  });
  test("Should be correct get for method asset", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "asset", "get");
    const { asset } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(asset).toBe("BTC");
    spy.mockRestore();
  });
  test("Should be correct get for method currency", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "currency", "get");
    const { currency } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(currency).toBe("ETH");
    spy.mockRestore();
  });
  test("Should be correct get for method timeframe", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "timeframe", "get");
    const { timeframe } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(timeframe).toBe(15);
    spy.mockRestore();
  });
  test("Should be correct get for method candle", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "candle", "get");
    const { candle } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(candle).toBeNull();
    spy.mockRestore();
  });
  test("Should be correct get for method candles", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "candles", "get");
    const { candles } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(candles).toEqual([]);
    spy.mockRestore();
  });
  test("Should be correct get for method candlesProps", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "candlesProps", "get");
    const { candlesProps } = baseIndicator;
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
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "log", "get");
    const { log } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(typeof log).toBe("function");
    spy.mockRestore();
  });
  test("Should be correct get for method logEvent", () => {
    const baseIndicator = new BaseIndicator(state);
    const spy = jest.spyOn(baseIndicator, "logEvent", "get");
    const { logEvent } = baseIndicator;
    expect(spy).toHaveBeenCalled();
    expect(typeof logEvent).toBe("function");
    spy.mockRestore();
  });
});
