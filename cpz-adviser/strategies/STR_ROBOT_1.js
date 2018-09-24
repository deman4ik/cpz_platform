async function run() {
  const newSignal = {
    alertTime: new Date().toISOString,
    action: "long",
    qty: 1,
    orderType: "stop",
    price: 1111,
    priceSource: "close",
    positionId: 11,
    candle: this.lastCandles.length > 2 ? this.lastCandles[0] : null,
    params: {
      slippageStep: 11,
      volume: 1
    }
  };
  await this.advice(newSignal);
}

module.exports = run;
