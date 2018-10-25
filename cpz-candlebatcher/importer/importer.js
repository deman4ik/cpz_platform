const dayjs = require("dayjs");
const { saveCandlesArray } = require("../db/saveCandles");
const { saveImporterState } = require("../tableStorage");
const { createSlug } = require("../tableStorage/utils");
const { queueImportIteration } = require("../queueStorage");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  LOG_EVENT,
  IMPORTER_SERVICE
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");

class Importer {
  constructor(context, state) {
    this.context = context;
    this.eventSubject = state.eventSubject;
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
    this.nextDate = state.nextDate;
    this.proxy = state.proxy;
    this.stopRequested = state.stopRequested || false;
    this.status = this.stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    this.startedAt = state.startedAt || dayjs().toJSON(); //  Дата и время запуска
    this.endedAt =
      state.endedAt || this.status === STATUS_STOPPED ? dayjs().toJSON() : ""; // Дата и время остановки
    this.initConnector();
    this.log(`Importer ${this.eventSubject} initialized`);
  }
  log(...args) {
    if (this.debug) {
      this.context.log.info(`Importer ${this.eventSubject}:`, ...args);
    }
  }

  logEvent(data) {
    if (this.debug) {
      // Публикуем событие - ошибка
      publishEvents(
        "log",
        createEvents({
          subject: this.eventSubject,
          eventType: LOG_EVENT,
          data: {
            service: IMPORTER_SERVICE,
            taskId: this.taskId,
            data
          }
        })
      );
    }
  }

  initConnector() {
    this.log(`initConnector()`);
    try {
      // TODO: check connection
            this.loadCandlesFunc = require(`../connectors/${this.providerType}`); // eslint-disable-line
      if (typeof this.loadCandlesFunc !== "function")
        throw new Error(`Connector "${this.providerType}" is not a function`);
    } catch (error) {
      throw new Error(`Can't find connector "${this.providerType}\n${error}"`);
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
    this.log(`getStatus()`);
    return this.status;
  }

  setStatus(status) {
    this.log(`setStatus()`, status);
    if (!this.nextDate && !status) {
      this.status = STATUS_FINISHED;
    } else {
      this.status = status || STATUS_STARTED;
    }
  }

  setError(error) {
    this.log(`setError()`, error);
    if (error)
      this.error = {
        time: new Date().toISOString(),
        error
      };
  }

  async loadCandles() {
    this.log(`loadCandles()`);
    const result = await this.loadCandlesFunc(
      this.context,
      this.getCurrentState()
    );
    this.log(`loadCandles() result:`, result);
    if (result.isSuccess) {
      this.nextDate = result.nextDate;
      this.totalDuration = result.totalDuration;
      this.completedDuration = result.completedDuration;
      this.leftDuration = result.leftDuration;
      this.percent = result.percent;
      this.candles = result.data;
      return { isSuccess: true };
    }
    throw result;
  }

  async saveCandles() {
    this.log(`saveCandles()`);
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: this.timeframe,
      candles: this.candles
    };
    const result = await saveCandlesArray(this.context, input);
    this.log(`saveCandles() result:`, result);
    return { isSuccess: result.status };
  }

  async queueNext() {
    this.log(`queueNext()`);
    if (this.nextDate) {
      const message = {
        rowKey: this.taskId,
        partitionKey: createSlug(this.exchange, this.asset, this.currency)
      };
      const queuedMessageResult = await queueImportIteration(
        this.context,
        message
      );
      this.log(`queueNext() result:`, queuedMessageResult);
      return queuedMessageResult;
    }
    return { isSuccess: true };
  }

  getCurrentState() {
    this.log(`getCurrentState()`);
    const state = {
      taskId: this.taskId,
      eventSubject: this.eventSubject,
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
      error: this.error,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
    return state;
  }
  async save() {
    this.log(`save()`);
    const result = await saveImporterState(
      this.context,
      this.getCurrentState()
    );
    if (!result.isSuccess) throw new Error(`Can't save state\n${result.error}`);
  }

  async end(status, error) {
    this.log(`end()`);
    this.setError(error);
    this.setStatus(status);
    await this.save();
  }
}

module.exports = Importer;
