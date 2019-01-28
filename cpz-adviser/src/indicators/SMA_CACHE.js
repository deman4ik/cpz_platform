const SMA = {
  init() {
    this.windowLength = this.options.windowLength;
    this.result = 0;
    this.prices = [];
  },
  calc() {
    // Если в кэше меньше свечей чем windowLength (работаем без кэша)
    if (this.candlesProps.close.length < this.windowLength) {
      // Накапливаем цены по одной
      this.prices.push(this.candle.close);
      // Оставляем только последние windowLength цен
      this.prices = this.prices.slice(
        Math.max(this.prices.length - this.windowLength, 0)
      );
    } else {
      // Если есть свечи из кэша - берем последние windowLength цен
      this.prices = this.candlesProps.close.slice(
        Math.max(this.candlesProps.close.length - this.windowLength, 0)
      );
    }
    // Проверяем, накопили ли нужное количество цен
    if (this.prices.length < this.windowLength) {
      // Если нет - пропускаем
      this.log("skip");
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
