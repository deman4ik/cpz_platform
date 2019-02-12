const activePosition = {
  init() {
    this.maxIndex = 1000;
    this.input = "candle";
    this.result = 0; // can be found further in logs

    this.debug = this.options.debug;
    this.highestSeries = [];
    this.highestSeries_size = this.options.highestSeriesSize;
    this.lowestSeries = [];
    this.lowestSeries_size = this.options.lowestSeriesSize;

    // public
    this.isPositionActive = false;
    this.entryAction = null;
    this.age = 0;
    this.activeHighSeries = [];
    this.activeLowSeries = [];
    this.highestSeriesHigh = null;
    this.lowestSeriesLow = null;
  },
  calc() {
    this.age += 1;
    // for active position only
    if (this.entryAction != null) {
      if (this.activeHighSeries.length < this.maxIndex) {
        this.activeHighSeries.push(this.candle.high);
      }
      if (this.activeLowSeries.length < this.maxIndex) {
        this.activeLowSeries.push(this.candle.low);
      }
    }

    // other props
    if (this.highestSeries_size) {
      if (this.highestSeries.length > this.highestSeries_size) {
        this.highestSeries.shift(); // correct length
        this.highestSeriesHigh = Math.max(...this.highestSeries); // save higestHigh of XX items not including current high
      }
      this.highestSeries.push(this.candle.high);
    }

    if (this.lowestSeries_size) {
      if (this.lowestSeries.length > this.lowestSeries_size) {
        this.lowestSeries.shift();
        this.lowestSeriesLow = Math.min(...this.lowestSeries);
      }
      this.lowestSeries.push(this.candle.low);
    }

    // //////// debug
    if (this.debug) {
      if (this.entryAction != null)
        this.log(
          `Debug: ACTIVE ${this.entryAction}_${this.activeHighSeries.length}`
        );
    }
  },
  setActive(what) {
    if (what === "short" || what === "sell") {
      this.entryAction = "sell";
      this.isPositionActive = true;
      this.result = this.candle.close;

      if (this.activeHighSeries.length < this.maxIndex) {
        this.activeHighSeries.push(this.candle.high);
      }
      if (this.activeLowSeries.length < this.maxIndex) {
        this.activeLowSeries.push(this.candle.low);
      }
    } else if (what === "long" || what === "buy") {
      this.entryAction = "buy";
      this.isPositionActive = true;
      this.result = this.candle.close;

      if (this.activeHighSeries.length < this.maxIndex) {
        this.activeHighSeries.push(this.candle.high);
      }
      if (this.activeLowSeries.length < this.maxIndex) {
        this.activeLowSeries.push(this.candle.low);
      }
    } else if (what === null) {
      // reset all
      this.entryAction = null;
      this.isPositionActive = false;
      this.activeHighSeries = [];
      this.activeLowSeries = [];
      this.result = 0;
    } else this.log("Error: Indicator ActivePosition.setActive: Wrong value");

    // //////// debug
    if (this.debug && what) this.log("Debug: setActive call");
  },
  highestHigh(i) {
    let res;
    if (this.entryAction != null && this.activeHighSeries.length > 0) {
      if (i > 0)
        this.log(
          "Error: Indicator ActivePosition.highestHigh: Wrong index, 0 - current, < 0 - previous"
        );
      if (!i) res = Math.max(...this.activeHighSeries);
      else res = Math.max(...this.activeHighSeries.slice(-Math.abs(i)));
    } else res = null;

    return res;
  },
  lowestLow(i) {
    let res;
    if (this.entryAction != null && this.activeLowSeries.length > 0) {
      if (i > 0)
        this.log(
          "Error: Indicator ActivePosition.lowestLow: Wrong index, 0 - current, < 0 - previous"
        );
      if (!i) res = Math.min(...this.activeLowSeries);
      else res = Math.min(...this.activeLowSeries.slice(-Math.abs(i)));
    } else res = null;

    return res;
  }
};

module.exports = activePosition;
