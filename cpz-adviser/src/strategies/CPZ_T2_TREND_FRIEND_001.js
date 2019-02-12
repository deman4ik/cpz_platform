const robot4 = {
  adviceEx(sAction, sOrderType, sPriceSource, nPrice) {
    // check params
    if (!sAction || !sOrderType) {
      this.log("Wrong parameters: sAction and sOrderType must be set");
      return;
    }

    if (
      sAction !== this.CONSTS.TRADE_ACTION_SHORT &&
      sAction !== this.CONSTS.TRADE_ACTION_LONG
    ) {
      this.log(`Wrong parameters: sAction has wrong value ${sAction}`);
      return;
    }

    if (
      sOrderType !== this.CONSTS.ORDER_TYPE_STOP &&
      sOrderType !== this.CONSTS.ORDER_TYPE_MARKET &&
      sOrderType !== this.CONSTS.ORDER_TYPE_LIMIT
    ) {
      this.log(`Wrong parameters: sOrderType has wrong value ${sOrderType}`);
      return;
    }

    let price_;
    let action_;

    if (nPrice) price_ = nPrice;
    else price_ = this.candle.close;
    if (sPriceSource === "open") price_ = this.candle.open;
    if (sPriceSource === "close") price_ = this.candle.close;
    if (sPriceSource === "high") price_ = this.candle.high;
    if (sPriceSource === "low") price_ = this.candle.low;

    if (!price_) {
      this.log("Wrong parameters: cannot define price");
      return;
    }

    // redefining action
    // do we need to close previously opened position or create new one
    if (
      this.lastSignal &&
      this.lastSignal.action === this.CONSTS.TRADE_ACTION_LONG
    ) {
      action_ = this.CONSTS.TRADE_ACTION_CLOSE_LONG;
    } else if (
      this.lastSignal &&
      this.lastSignal.action === this.CONSTS.TRADE_ACTION_SHORT
    ) {
      action_ = this.CONSTS.TRADE_ACTION_CLOSE_SHORT;
    } else {
      this.positionNum += 1;
      this.createPosition({ code: `p${this.positionNum}` });
      action_ = sAction;
    }

    // preparing signal
    this.lastSignal = {
      action: action_,
      orderType: sOrderType,
      price: price_,
      priceSource: sPriceSource,
      positionId: this.positions[`p${this.positionNum}`].positionId,
      settings: {
        positionCode: this.positions[`p${this.positionNum}`].code
      }
    };

    // issuing signal
    this.advice(this.lastSignal);
  },
  init() {
    this.log("init");
    this.positionNum = 0;
    this.minBarsToHold = 3; // param
    this.heldEnoughBars = 0; // bar counter, how much bars for holding postions we need at least
    this.lastSignal = null;
    this.adviceNext = null; // shift signal to bar+1

    // using SMA_CACHE to skip warm up, needs to run adviser with "requiredHistoryCache":true, "requiredHistoryMaxBars":30
    this.addIndicator("sma1", "SMA_CACHE", { windowLength: 10 });
    this.addIndicator("sma2", "SMA_CACHE", { windowLength: 20 });
    this.addIndicator("sma3", "SMA_CACHE", { windowLength: 30 });
  },
  check() {
    // const price = this.candle.close;
    const sma1 = this.indicators.sma1.result;
    const sma2 = this.indicators.sma2.result;
    const sma3 = this.indicators.sma3.result;

    // this.log("sma3:" + sma3); // log to console
    // this.logEvent({sma1, sma2, sma3}); // log to storage with auto adding candle props

    // if we run without "requiredHistoryCache":true then skipping
    if (sma1 === 0 || sma2 === 0 || sma3 === 0) return;

    if (this.adviceNext === "buy") {
      this.adviceEx("long", "market", "open");
      this.adviceNext = null;
    } else if (this.adviceNext === "sell") {
      this.adviceEx("short", "market", "open");
      this.adviceNext = null;
    }

    // if last position opened
    if (this.lastSignal && this.lastSignal.action === "long") {
      this.heldEnoughBars += 1;
      // exit condition
      if (
        this.candle.close < sma1 &&
        this.heldEnoughBars > this.minBarsToHold // > - do not count entry bar
      ) {
        this.heldEnoughBars = 0; // clear bars counter
        this.adviceNext = "sell";
      }
    }
    // enter condition
    else if (
      this.candle.close > sma1 &&
      (sma1 > sma2 && sma1 > sma3 && sma2 > sma3)
    ) {
      this.heldEnoughBars = 1; // open bar counter
      this.adviceNext = "buy";
    }
  }
};

module.exports = robot4;
