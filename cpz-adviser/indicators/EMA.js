const BaseIndicator = require("../adviser/baseIndicator");

class EMA extends BaseIndicator {
  init() {
    this.input = "price";
    this.weight = this.options.weight;
    this.result = false;
    this.age = 0;
  }
  calc() {
    this.log("calc");
    this.price = this.candle.close;
    // The first time we can't calculate based on previous
    // ema, because we haven't calculated any yet.
    if (this.result === false) this.result = this.price;

    this.age += 1;
    // weight factor
    const k = 2 / (this.weight + 1);

    // yesterday
    const y = this.result;

    // calculation
    this.result = this.price * k + y * (1 - k);
    this.log(this.result);
  }
}

module.exports = EMA;
