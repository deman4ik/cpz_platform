const BaseStrategy = require("../adviser/baseStrategy");

class StrRobot2 extends BaseStrategy {
  init() {
    this._context.log("init");
    this.userDefinedVar = "test";
    this.myInitialVar = {
      some: "value"
    };
  }

  check() {
    this._context.log("check");
    this._context.log(this.candle);
    const newSignal = {
      alertTime: new Date().toISOString,
      action: "long",
      qty: 2,
      orderType: "stop",
      price: 2222,
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
