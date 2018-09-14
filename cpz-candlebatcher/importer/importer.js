const { saveCandlesArray } = require("../db/saveCandles");
const { saveImporterState } = require("../tableStorage");
const { createSlug } = require("../tableStorage/utils");
const { queueImportIteration } = require("../queueStorage");

class Importer {
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
    this.timeframe = state.timeframe;
    this.limit = state.limit;
    this.totalDuration = state.totalDuration;
    this.completedDuration = state.completedDuration || 0;
    this.leftDuration = state.leftDuration;
    this.percent = state.percent || 0;
    this.dateFrom = state.dateFrom;
    this.dateTo = state.dateTo;
    this.nextDate = state.nextDate || this.dateTo;
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
  setStatus(status) {
    if (!this.nextDate && !status) {
      this.status = "finished";
    } else {
      this.status = status || "started";
    }
  }

  setError(error) {
    this.error = error;
  }

  async loadCandles() {
    const result = await this.loadCandlesFunc(
      this.context,
      this.getCurrentState()
    );
    this.nextDate = result.nextDate;
    this.totalDuration = result.totalDuration;
    this.completedDuration = result.completedDuration;
    this.leftDuration = result.leftDuration;
    this.percent = result.percent;
    this.candles = result.data;
  }

  async saveCandle() {
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: this.timeframe,
      candles: this.candles
    };
    const result = await saveCandlesArray(this.context, input);
    return { isSuccess: result.status };
  }

  async queueNext() {
    if (this.nextDate) {
      const message = {
        rowKey: this.taskId,
        partitionKey: createSlug(this.exchange, this.asset, this.currency)
      };
      const queuedMessageResult = await queueImportIteration(
        this.context,
        message
      );
      return queuedMessageResult;
    }
    return { isSuccess: true };
  }
  createSubject(timeframe) {
    // "{Exchange}/{Asset}/{Currency}/{Timeframe}/{TaskId}.{B/E/R}"

    return `${this.exchange}/${this.asset}/${this.currency}/${timeframe}/${
      this.taskId
    }.${this.modeStr}`;
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
      timeframe: this.timeframe,
      limit: this.limit,
      totalDuration: this.totalDuration,
      completedDuration: this.completedDuration,
      leftDuration: this.leftDuration,
      percent: this.percent,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      nextDate: this.nextDate,
      proxy: this.proxy,
      status: this.status,
      error: this.error
    };
  }
  async save() {
    const result = await saveImporterState(
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

module.exports = Importer;
