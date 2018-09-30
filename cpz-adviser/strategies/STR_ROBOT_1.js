const BaseStrategy = require("../adviser/baseStrategy");

class StrRobot1 extends BaseStrategy {
  userDefinedFunc() {
    this._context.log(this.userDefinedVar);
  }
  init() {
    this._context.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
    this.addIndicator("MyEMA", "EMA", { weight: 1 });
  }

  check() {
    this._context.log("check");
    this._context.log(this.candle);
    this._context.log(this.indicators.MyEMA.result);
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
