const SMA = {
  init() {
    this.windowLength = this.options.windowLength;
    this.result = 0;
    this.prices = [];
  },
  calc() {
    // Если есть свечи из кэша - берем последние windowLength цен
    this.prices = this.candlesProps.close.slice(
      Math.max(this.candlesProps.close.length - this.windowLength, 0)
    );

    // Проверяем, есть ли нужное количество цен
    if (this.prices.length < this.windowLength) {
      // Если нет - результат 0
      this.log("skip");
      this.result = 0;
      return;
    }
    // Суммируем
    let sum = 0;
    sum += this.prices.reduce((a, b) => a + b, 0);
    // Считаем среднее
    this.result = sum / this.prices.length;
  }
};

module.exports = SMA;
