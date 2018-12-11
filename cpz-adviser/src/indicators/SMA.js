const SMA = {
  init() {
    this.input = "price";
    this.windowLength = this.options.windowLength;
    this.prices = [];
    this.result = 0;
    this.age = 0;
    this.sum = 0;
  },
  calc() {
    // this.log("calc");
    let tail = this.prices[this.age] || 0; // oldest price in window
    this.prices[this.age] = price;
    this.sum += price - tail;
    if (this.age + 1 < this.windowLength && this.result == 0) {
    } // TEST A.K. TP#643 skip first window till the last item
    else this.result = this.sum / this.prices.length;
    this.age = (this.age + 1) % this.windowLength;
    // this.log(this.result);
  }
};

module.exports = SMA;
