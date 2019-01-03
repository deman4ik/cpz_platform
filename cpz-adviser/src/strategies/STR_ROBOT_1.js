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
    const first = this.count % 2 !== 0;
    if (first) {
      this.createPosition({ code: `p${this.count}` });
    }

    const newSignal = {
      action: first ? "long" : "closeLong",
      orderType: "market",
      price: first ? 100 : 10000,
      positionId: this.positions[`p${first ? this.count : this.count - 1}`]
        .positionId
      /* settings: {
        slippageStep: 11,
        volume: 1
      } */
    };
    // this.logEvent(newSignal);
    this.advice(newSignal);
  }
};

module.exports = StrRobot1;
