const uuid = require("uuid").v4;
const { saveCandle } = require("../db/saveCandles");
const { saveCandlebatcherState } = require("../tableStorage");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  CANDLES_NEW_CANDLE_EVENT,
  LOG_EVENT
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");

class Candlebatcher {
  constructor(context, state) {
    this.context = context;
    this.eventSubject = state.eventSubject;
    this.taskId = state.taskId;
    this.mode = state.mode;
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
    this.updateRequested = state.updateRequested || false;
    this.stopRequested = state.stopRequested || false;
    this.status = this.stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    this.initConnector();
    this.log(`Candlebatcher ${this.eventSubject} initialized`);
  }

  initConnector() {
    this.log(`initConnector()`);
    try {
      // TODO: check connection
      this.loadCandlesFunc = require(`../connectors/${this.providerType}`); // eslint-disable-line
      if (typeof this.loadCandlesFunc !== "function")
        throw new Error(`Connector "${this.providerType}" is not a function`);
    } catch (err) {
      throw new Error(`Can't find connector "${this.providerType}"`);
    }
  }

  log(...args) {
    if (this.debug) {
      this.context.log.info(`Candlebatcher ${this.eventSubject}:`, ...args);
    }
  }

  logEvent(data) {
    if (this.debug) {
      // Публикуем событие - ошибка
      publishEvents(
        this.context,
        "log",
        createEvents({
          subject: this.eventSubject,
          eventType: LOG_EVENT,
          data: {
            taskId: this.taskId,
            data: JSON.stringify(data)
          }
        })
      );
    }
  }

  getStatus() {
    this.log(`getStatus()`);
    return this.status;
  }

  getUpdateRequested() {
    this.log(`getUpdateRequested()`);
    return this.updateRequested;
  }

  setStatus(status) {
    this.log(`setStatus()`, status);
    if (status) this.status = status;
  }

  setUpdate(updatedFields = this.updateRequested) {
    this.log(`setStatus()`, updatedFields);
    this.debug = updatedFields.debug;
    this.timeframes = updatedFields.timeframes;
    this.proxy = updatedFields.proxy;
  }

  setError(error) {
    this.log(`setError()`, error);
    if (error)
      this.error = {
        time: new Date().toISOString(),
        error
      };
  }

  async loadCandle() {
    this.log(`loadCandle()`);
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: 1,
      limit: 1
    };

    const result = await this.loadCandlesFunc(this.context, input);
    this.log(`loadCandles() result:`, result);
    if (!this.lastLoadedCandle || this.lastLoadedCandle.time !== result.time) {
      this.lastLoadedCandle = result;
      return { isSuccess: true };
    }
    throw new Error("Loaded same candle.");
  }

  async saveCandle() {
    this.log(`saveCandle()`);
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      ...this.lastLoadedCandle
    };
    const result = await saveCandle(this.context, input);
    this.log(`saveCandle() result:`, result);
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
    const modeToStr = mode => {
      switch (mode) {
        case "realtime":
          return "R";
        case "backtest":
          return "B";
        case "emulator":
          return "E";
        default:
          return "R";
      }
    };
    return `${this.exchange}/${this.asset}/${this.currency}/${timeframe ||
      JSON.stringify(this.timeframes)}/${this.taskId}.${modeToStr(this.mode)}`;
  }

  getEvents() {
    this.log(`getEvents()`);
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
    this.log(`getCurrentState()`);
    return {
      taskId: this.taskId,
      eventSubject: this.eventSubject,
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
    this.log(`save()`);
    const state = this.getCurrentState();
    if (this.updateRequested) {
      state.updateRequested = false;
    }
    if (this.stopRequested) {
      state.stopRequested = false;
    }
    const result = await saveCandlebatcherState(this.context, state);
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
  }

  async end(status, error) {
    this.log(`end()`);
    this.setStatus(status);
    this.setError(error);
    await this.save();
  }
}

module.exports = Candlebatcher;
