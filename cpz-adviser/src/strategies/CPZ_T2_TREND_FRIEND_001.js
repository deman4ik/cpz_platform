const robot4 = {
  adviceEx(sAction, sOrderType, sPriceSource, nPrice) {
    if (!sAction || !sOrderType) return;

    if (sAction !== "short" && sAction !== "long") return;

    if (sOrderType !== "stop" && sOrderType !== "market") return;

    let price;
    let source;
    if (sPriceSource && nPrice) {
      price = nPrice;
      source = "stop";
    } else {
      if (sPriceSource === "open") price = this.candle.open;
      if (sPriceSource === "close") price = this.candle.close;
      if (sPriceSource === "high") price = this.candle.high;
      if (sPriceSource === "low") price = this.candle.low;
      if (!price) return;
      source = sPriceSource;

      if (!sPriceSource && !nPrice) {
        price = this.candle.close;
        source = "close";
      }
    }

    this.positionId += 1;
    const newSignal = {
      alertTime: new Date().toISOString,
      action: sAction,
      // qty: 1,
      orderType: sOrderType,
      price,
      priceSource: source,
      positionId: this.positionId
    };
    this.advice(newSignal);
  },
  init() {
    this.log("init");
    this.requiredHistory = 15; // just for info
    this.positionId = 0;
    this.addIndicator("sma1", "SMA", { windowLength: 10 });
    this.addIndicator("sma2", "SMA", { windowLength: 20 });
    this.addIndicator("sma3", "SMA", { windowLength: 30 });
  },
  check() {
    this.log("check");
    this.log(this.candle);

    const price = this.candle.close;
    const sma1 = this.indicators.sma1.result;
    const sma2 = this.indicators.sma2.result;
    const sma3 = this.indicators.sma3.result;

    this.logEvent({
      sma1,
      sma2,
      sma3,
      price
    });

    if (
      this.indicators.sma1.result === 0 ||
      this.indicators.sma2 === 0 ||
      this.indicators.sma3 === 0
    )
      return;

    if (this.myPropSignal === 1) this.adviceEx("long", "open");
    if (this.myPropSignal === 2) this.adviceEx("short", "open");

    if (
      this.candle.close > sma1 &&
      (sma1 > sma2 && sma1 > sma3) &&
      sma2 > sma3
    ) {
      this.myPropSignal = 1; // buy
    } else if (this.candle.close < sma1) {
      this.myPropSignal = 2; // sell
    } else {
      this.myPropSignal = 0;
    }
  }
};

module.exports = robot4;
