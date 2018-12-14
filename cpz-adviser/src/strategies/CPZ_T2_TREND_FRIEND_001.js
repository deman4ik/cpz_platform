const robot4 = {
  adviceEx(sAction, sOrderType, sPriceSource, nPrice) {
    // check params
    if (!sAction || !sOrderType) return;

    if (
      sAction !== this.CONSTS.TRADE_ACTION_SHORT &&
      sAction !== this.CONSTS.TRADE_ACTION_LONG
    )
      return;

    if (
      sOrderType !== this.CONSTS.ORDER_TYPE_STOP &&
      sOrderType !== this.CONSTS.ORDER_TYPE_MARKET
    )
      return;

    let price_;
    let source_;
    let action_;

    // define price source if we got price
    if (sPriceSource && nPrice) {
      price_ = nPrice;
      source_ = "stop";
    } else {
      if (sPriceSource === "open") price_ = this.candle.open;
      if (sPriceSource === "close") price_ = this.candle.close;
      if (sPriceSource === "high") price_ = this.candle.high;
      if (sPriceSource === "low") price_ = this.candle.low;
      source_ = sPriceSource;

      if (!sPriceSource && !nPrice) {
        price_ = this.candle.close;
        source_ = "close";
      }

      if (!price_) return;
    }

    // do we need to close previously opened position or create new one
    if (this.prevAction === this.CONSTS.TRADE_ACTION_LONG) {
      action_ = this.CONSTS.TRADE_ACTION_CLOSE_LONG;
    } else if (this.prevAction === this.CONSTS.TRADE_ACTION_SHORT) {
      action_ = this.CONSTS.TRADE_ACTION_CLOSE_SHORT;
    } else {
      this.positionId += 1;
      this.createPosition({ code: `p${this.positionId}` });
      action_ = sAction;
    }

    this.prevAction = action_;

    // preparing signal
    const newSignal = {
      action: action_,
      orderType: sOrderType,
      price: price_,
      priceSource: source_,
      positionId: this.positions[`p${this.positionId}`].positionId,
      positionOptions: {
        code: `p${this.positionId}`
      }
    };

    // issue signal
    this.advice(newSignal);
  },
  init() {
    this.log("init");
    this.positionId = 0;
    this.myPropSignal = 0;
    this.prevAction = "#";
    this.minBarsToHold = 3; // param
    this.heldEnoughBars = 0; // bar counter, how much bars for holding postions we need at least
    this.addIndicator("sma1", "SMA", { windowLength: 10 });
    this.addIndicator("sma2", "SMA", { windowLength: 20 });
    this.addIndicator("sma3", "SMA", { windowLength: 30 });
  },
  check() {
    // this.log("check");
    // this.log(this.candle);

    const price = this.candle.close;
    const sma1 = this.indicators.sma1.result;
    const sma2 = this.indicators.sma2.result;
    const sma3 = this.indicators.sma3.result;

    this.logEvent({
      sma1,
      sma2,
      sma3,
      price
    });

    if (this.heldEnoughBars > 0) this.heldEnoughBars += 1;

    if (sma1 === 0 || sma2 === 0 || sma3 === 0) return;

    if (this.myPropSignal === 1)
      this.adviceEx(
        this.CONSTS.TRADE_ACTION_LONG,
        this.CONSTS.ORDER_TYPE_MARKET,
        "open"
      );
    if (this.myPropSignal === 2)
      this.adviceEx(
        this.CONSTS.TRADE_ACTION_SHORT,
        this.CONSTS.ORDER_TYPE_MARKET,
        "open"
      );

    if (
      this.heldEnoughBars === 0 &&
      this.candle.close > sma1 &&
      (sma1 > sma2 && sma1 > sma3) &&
      sma2 > sma3
    ) {
      this.myPropSignal = 1; // buy
      this.heldEnoughBars = 1; // open bar counter
    } else if (this.candle.close < sma1) {
      this.myPropSignal = 2; // sell
    } else {
      this.myPropSignal = 0;
      this.heldEnoughBars = 0; // clear bar counter
    }
  }
};

module.exports = robot4;
