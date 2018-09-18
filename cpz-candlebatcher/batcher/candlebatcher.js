const uuid = require("uuid").v4;

const { saveCandle } = require("../db/saveCandles");
const {
  saveCandlebatcherState,
  updateCandlebatcherState
} = require("../tableStorage");
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
    this.lastLoadedCandle = state.lastLoadedCandle || {};
    this.lastCandles = state.lastCandles || {};
    this.sendedCandles = state.sendedCandles || {};
    this.proxy = state.proxy;
    this.status = this.stopRequested ? "stopped" : state.status || "started";
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
  getStatus() {
    return this.status;
  }

  getUpdateRequested() {
    return this.updateRequested;
  }
  setStopRequested() {
    this.stopRequested = true;
  }
  setUpdateRequested(updatedFields) {
    const updatedState = {
      debug: updatedFields.debug,
      timeframes: updatedFields.timeframes,
      proxy: updatedFields.proxy
    };
    this.updateRequested = updatedState;
  }

  setUpdate(updatedFields = this.updateRequested) {
    this.debug = updatedFields.debug;
    this.timeframes = updatedFields.timeframes;
    this.proxy = updatedFields.proxy;
  }

  setStatus(status) {
    if (status) this.status = status;
  }

  setError(error) {
    if (error)
      this.error = {
        time: new Date().toISOString(),
        error
      };
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
    if (!this.lastLoadedCandle || this.lastLoadedCandle.time !== result.time) {
      this.lastLoadedCandle = result;
      return { isSuccess: true };
    }
    throw new Error("Loaded same candle.");
  }

  async saveCandle() {
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      ...this.lastLoadedCandle
    };
    const result = await saveCandle(this.context, input);
    this.context.log.info(result);
    if (result.isSuccess) {
      if (result.data.error) {
        if (result.data.error.code === "timeframe")
          return {
            ...this.getCurrentState(),
            providerType: "ccxt",
            lastLoadedCandle: undefined,
            sendedCandles: undefined,
            isSuccess: false,
            importRequested: true,
            timeframe: 1,
            dateFrom: result.data.error.start,
            dateTo: result.data.error.end
          };

        return result.error;
      }
      this.lastCandles = result.data;
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
    const currentSendedCandles = [];
    Object.keys(this.lastCandles).forEach(key => {
      const current = this.lastCandles[key];
      const sended = this.sendedCandles[key];
      if (!sended || current.id !== sended.id) {
        const currentTimeframe = parseInt(key.replace("timeframe", ""), 10);
        const newEvent = {
          id: uuid(),
          dataVersion: "1.0",
          eventTime: new Date(),
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
        currentSendedCandles.push(current);
        events.push(newEvent);
      }
    });
    this.sendedCandles = currentSendedCandles;
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
      lastLoadedCandle: this.lastLoadedCandle,
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
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
  }

  async updateState() {
    const newState = {
      taskId: this.taskId,
      debug: this.debug,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframes: this.timeframes,
      proxy: this.proxy,
      error: this.error,
      stopRequested: this.stopRequested,
      updateRequested: this.updateRequested
    };
    const result = await updateCandlebatcherState(this.context, newState);
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
  }

  async end(error, status) {
    this.setError(error);
    this.setStatus(status || "started");
    await this.save();
  }
}

module.exports = Candlebatcher;
