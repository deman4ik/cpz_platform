async function run() {
  const newSignal = {
    alertTime: new Date().toISOString,
    action: "short",
    qty: 22,
    orderType: "limit",
    price: 2222,
    priceSource: "open",
    positionId: 22,
    params: {
      slippageStep: 200,
      volume: 2
    }
  };
  await this.advice(newSignal);
}

module.exports = run;
