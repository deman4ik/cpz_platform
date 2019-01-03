const StrRobot1 = {
  init() {
    this.log("init");
    // this.userDefinedVar = "test";
    /* this.myInitialVar = {
      some: "value"
    }; */
    this.count = 0;
    this.price = 0;
    this.action = null;
    // this.addIndicator("MyEMA", "EMA", { weight: 1 });
  },
  check() {
    this.log("check");

    let makeAdvice = false;
    if (this.price === 0 || this.action === "closeLong") {
      this.action = "long";
      this.count += 1;
      this.createPosition({ code: `p${this.count}` });
      this.price = this.candle.close;
      makeAdvice = true;
    } else if (this.action === "long" && this.candle.close > this.price) {
      this.action = "closeLong";
      makeAdvice = true;
    }

    if (makeAdvice) {
      const newSignal = {
        action: this.action,
        orderType: "limit",
        price: this.candle.close,
        positionId: this.positions[`p${this.count}`].positionId
        /* settings: {
        slippageStep: 11,
        volume: 1
      } */
      };
      this.log(newSignal);
      this.advice(newSignal);
    }
  }
};

module.exports = StrRobot1;
