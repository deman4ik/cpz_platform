const StrRobot1 = {
  userDefinedFunc() {
    this.log(this.userDefinedVar);
  },
  init() {
    this.log("init");
    // this.userDefinedVar = "test";
    /* this.myInitialVar = {
      some: "value"
    }; */
    this.count = 0;
    // this.addIndicator("MyEMA", "EMA", { weight: 1 });
  },
  check() {
    // this.log("check");
    // this.log(this.candle);
    // this.log(this.userDefinedVar);
    // this.log(this.indicators.MyEMA.result);
    // this.userDefinedFunc();
    this.count += 1;
    const newSignal = {
      alertTime: new Date().toISOString(),
      action: this.count % 2 !== 0 ? "short" : "closeShort",
      qty: 1,
      orderType: "limit",
      price: this.candle.close,
      priceSource: "close",
      positionId:
        this.count % 2 !== 0
          ? this.count.toString()
          : (this.count - 1).toString()
      /* settings: {
        slippageStep: 11,
        volume: 1
      } */
    };
    this.logEvent(newSignal);
    this.advice(newSignal);
  }
};

module.exports = StrRobot1;
