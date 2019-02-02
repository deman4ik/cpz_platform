const SMACheck = {
  init() {
    this.addIndicator("sma1", "SMA", { windowLength: 10 });
    this.addIndicator("sma2", "SMA", { windowLength: 20 });
    this.addIndicator("sma3", "SMA", { windowLength: 30 });
    this.addIndicator("sma1_c", "SMA_CACHE", { windowLength: 10 });
    this.addIndicator("sma2_c", "SMA_CACHE", { windowLength: 20 });
    this.addIndicator("sma3_c", "SMA_CACHE", { windowLength: 30 });
    this.addTulipIndicator("sma1_t", "sma", { optInTimePeriod: 10 });
    this.addTulipIndicator("sma2_t", "sma", { optInTimePeriod: 20 });
    this.addTulipIndicator("sma3_t", "sma", { optInTimePeriod: 30 });
  },
  check() {
    this.log("sma1", this.indicators.sma1.result);
    this.log("sma1_c", this.indicators.sma1_c.result);
    this.log("sma1_t", this.indicators.sma1_t.result);

    this.log("sma2", this.indicators.sma2.result);
    this.log("sma2_c", this.indicators.sma2_c.result);
    this.log("sma2_t", this.indicators.sma2_t.result);

    this.log("sma3", this.indicators.sma3.result);
    this.log("sma3_c", this.indicators.sma3_c.result);
    this.log("sma3_t", this.indicators.sma3_t.result);
  }
};

module.exports = SMACheck;
