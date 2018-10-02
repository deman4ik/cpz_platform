const BaseStrategy = require("../adviser/baseStrategy");

class StrRobot1 extends BaseStrategy {
  userDefinedFunc() {
    this.log(this.userDefinedVar);
  }
  init() {
    this.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
    this.addIndicator("MyEMA", "EMA", { weight: 1 });
  }

  check() {
    this.log("check");
    this.log(this.candle);
    this.log(this.indicators.MyEMA.result);
    this.userDefinedFunc();
    const newSignal = {
      alertTime: new Date().toISOString,
      action: "long",
      qty: 1,
      orderType: "stop",
      price: 1111,
      priceSource: "close",
      positionId: 11,
      params: {
        slippageStep: 11,
        volume: 1
      }
    };
    this.advice(newSignal);
  }
}

module.exports = StrRobot1;
