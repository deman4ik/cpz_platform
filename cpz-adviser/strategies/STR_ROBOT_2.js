const BaseStrategy = require("../adviser/baseStrategy");

class StrRobot2 extends BaseStrategy {
  init() {
    this.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
    this.addTulipIndicator("myEMA", "ema", { optInTimePeriod: 10 });
  }

  check() {
    this.log("check");
    this.log(this.candle);
    this.log(this.indicators.myEMA.result);
    const newSignal = {
      alertTime: new Date().toISOString,
      action: "long",
      qty: 2,
      orderType: "stop",
      price: this.indicators.myEMA.result,
      priceSource: "close",
      positionId: 22,
      params: {
        slippageStep: 22,
        volume: 2
      }
    };
    this.advice(newSignal);
  }
}

module.exports = StrRobot2;
