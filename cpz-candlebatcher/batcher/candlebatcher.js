const uuid = require("uuid").v4;
const { saveCandle } = require("../db/saveCandles");
const { saveCandlebatcherState } = require("../tableStorage");
const { CANDLES_NEW_CANDLE_EVENT } = require("../config");

class Candlebatcher {
  constructor(context, state) {
    this.context = context;
    this.taskId = state.taskId;
    this.mode = state.mode;
    this.initModStr();
    this.debug = state.debug;
    this.providerType = state.providerType;
    this.exchange = state.exchange;
    this.asset = state.asset;
    this.currency = state.currency;
    this.timeframes = state.timeframes;
    this.prevCandle = state.prevCandle;
    this.currentCandles = state.currentCandles || {};
    this.sendedCandles = state.sendedCandles || {};
    this.proxy = state.proxy;
    this.status = state.status || "started";
    this.initConnector();
  }

  initConnector() {
    try {
      // TODO: check connection
      this.loadCandlesFunc = require(`../connectors/${this.providerType}`); // eslint-disable-line
      if (typeof this.loadCandlesFunc !== "function")
        throw new Error(`Connector "${this.providerType}" is not a function`);
    } catch (err) {
      throw new Error(`Can't find connector "${this.providerType}"`);
    }
  }
  initModStr() {
    switch (this.mode) {
      case "realtime":
        this.modeStr = "R";
        break;
      case "backtest":
        this.modeStr = "B";
        break;
      case "emulator":
        this.modeStr = "E";
        break;
      default:
        this.modeStr = "R";
        break;
    }
  }
  setStatus(status = "started") {
    this.status = status;
  }

  setError(error) {
    this.error = error;
  }

  async loadCandle() {
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: 1,
      limit: 1
    };

    const result = await this.loadCandlesFunc(this.context, input);
    if (!this.currentCandle || this.currentCandle.time !== result.time) {
      this.currentCandle = result;
      return { isSuccess: true };
    }
    throw new Error("Loaded same candle.");
  }

  async saveCandle() {
    const result = await saveCandle(this.context, this.currentCandle);
    if (result.isSuccess) {
      if (result.data.error) {
        if (result.data.error.code === "timeframe")
          return {
            ...this.getCurrentState(),
            prevCandle: undefined,
            currentCandles: undefined,
            sendedCandles: undefined,
            isSuccess: false,
            importRequested: true,
            timeframe: 1,
            dateFrom: result.data.error.start,
            dateTo: result.data.error.end
          };

        return result.error;
      }
      this.currentCandles = result.data;
      return { isSuccess: true };
    }
    return result;
  }

  createSubject(timeframe) {
    // "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}"

    return `${this.exchange}/${this.asset}/${this.currency}/${timeframe}/${
      this.taskId
    }.${this.modeStr}`;
  }

  getEvents() {
    const events = [];
    Object(this.currentCandles).keys.forEach(key => {
      const current = this.currentCandles[key];
      const sended = this.sendedCandles[key];
      if (current.id !== sended.id) {
        const currentTimeframe = parseInt(key.replace("timeframe", ""), 10);
        const newEvent = {
          id: uuid(),
          subject: this.createSubject(currentTimeframe),
          eventType: CANDLES_NEW_CANDLE_EVENT,
          data: {
            candleId: current.id,
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            timeframe: currentTimeframe,
            time: current.time || current.end,
            open: current.open,
            close: current.close,
            high: current.high,
            low: current.low,
            volume: current.volume
          }
        };
        events.push(newEvent);
      }
    });
    return events;
  }

  getCurrentState() {
    return {
      taskId: this.taskId,
      mode: this.mode,
      debug: this.debug,
      providerType: this.providerType,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframes: this.timeframes,
      prevCandle: this.prevCandle,
      sendedCandles: this.sendedCandles,
      proxy: this.proxy,
      status: this.status,
      error: this.error
    };
  }
  async save() {
    const result = await saveCandlebatcherState(
      this.context,
      this.getCurrentState()
    );
    if (!result.isSuccess) throw new Error(`Can't save state\n${result.error}`);
  }

  async end(error, status) {
    if (error) {
      this.error = error;
    }

    this.setStatus(status);
    await this.save();
  }
}

module.exports = Candlebatcher;
