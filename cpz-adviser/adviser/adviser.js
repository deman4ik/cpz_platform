const uuid = require("uuid").v4;
const dayjs = require("dayjs");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  SIGNALS_NEW_SIGNAL_EVENT,
  LOG_EVENT
} = require("../config");
const { saveAdviserState } = require("../tableStorage");
const { publishEvents, createEvents } = require("../eventgrid");

/**
 * Класс советника
 *
 * @class Adviser
 */
class Adviser {
  /**
   *Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    this.context = context; // текущий контекст выполнения
    this.eventSubject = state.eventSubject; // тема события
    this.taskId = state.taskId; // уникальный идентификатор задачи
    this.mode = state.mode; // режим работы ['backtest', 'emulator', 'realtime']
    this.debug = state.debug; // режима дебага [true,false]
    this.strategy = state.strategy; // имя файла стратегии
    this.exchange = state.exchange; // код биржи
    this.asset = state.asset; // базовая валюта
    this.currency = state.currency; // котировка валюты
    this.timeframe = state.timeframe; // таймфрейм
    this.currentCandle = state.currentCandle || {}; // текущая свеча
    this.lastCandles = state.lastCandles || []; // массив последних свечей
    this.lastSignals = state.lastSignals || []; // массив последних сигналов
    this.sendSignals = []; // массив сигналов к отправке
    this.settings = state.settings || {}; // объект настроек из веб-интерфейса
    this.variables = state.variables || {}; // объект переменных используемых в стратегии
    this.updateRequested = state.updateRequested || false; // объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false
    this.stopRequested = state.stopRequested || false; // признак запроса на остановку сервиса [true,false]
    this.status = this.stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED; // текущий статус сервиса
    this.startedAt = state.startedAt || dayjs().toJSON(); //  Дата и время запуска
    this.endedAt =
      state.endedAt || this.status === STATUS_STOPPED ? dayjs().toJSON() : ""; // Дата и время остановки
    this.initStrategy();
  }
  /**
   * Инициализации функций стратегии
   *
   * @memberof Adviser
   */
  initStrategy() {
    try {
      // TODO: использовать 2 метода init и run
    this.stretegyFunc = require(`../strategies/${this.strategy}`).bind(this); // eslint-disable-line
      if (typeof this.stretegyFunc !== "function")
        throw new Error(`Strategy "${this.strategy}" is not a function`);
    } catch (err) {
      throw new Error(`Can't find strategy "${this.strategy}"`);
    }
  }
  /**
   *  Инициализация индикаторов
   *
   * @memberof Adviser
   */
  // TODO: Индикаторы инициализируются непосредственно в стратегии
  /* initIndicators() {
    const indicators = {};
    Object.keys(this.indicatorsParams).forEach(key => {
      const prm = this.indicatorsParams[key];
      try {
        const newIndicator = {
          id: prm.id,
          name: prm.name,
          prevValues: [],
          value: null,
          calc: require(`../indicators/${prm.name}`),//eslint-disable-line
          ...prm
        };
        indicators[prm.id] = newIndicator;
      } catch (err) {
        this.context.log(err);
        throw new Error(`Can't inialize indicator ${prm.name}`);
      }
    });
    return indicators;
  } */
  /**
   * Пересчет индикаторов
   *
   * @memberof Adviser
   */
  /*
  async calcIndicators() {
    context.log("Calculating indicators");
    const results = await Promise.all(
      Object.keys(this.indicators).map(async key => {
        const indicator = this.indicators[key];
        const result = await indicator.calc(context);
        return result;
      })
    );
    this.context.log(results);
  } */

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this.debug) {
      this.context.log.info(`Adviser ${this.eventSubject}:`, ...args);
    }
  }
  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Adviser
   */
  logEvent(data) {
    // Публикуем событие - ошибка
    publishEvents(
      this.context,
      "log",
      createEvents({
        subject: this.eventSubject,
        eventType: LOG_EVENT,
        data: {
          taskId: this.taskId,
          data
        }
      })
    );
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns
   * @memberof Adviser
   */
  getStatus() {
    return this.status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns
   * @memberof Adviser
   */
  getUpdateRequested() {
    return this.updateRequested;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Adviser
   */
  setStatus(status) {
    if (status) this.status = status;
  }

  /**
   * Установка новых параметров
   *
   * @param {*} [updatedFields=this.updateRequested]
   * @memberof Adviser
   */
  setUpdate(updatedFields = this.updateRequested) {
    this.log(`setStatus()`, updatedFields);
    this.debug = updatedFields.debug;
    this.settings = updatedFields.settings;
  }

  /**
   * Установка объекта с ошибкой
   *
   * @param {*} error
   * @memberof Adviser
   */
  setError(error) {
    if (error)
      this.error = {
        time: new Date().toISOString(),
        error
      };
  }

  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Adviser
   */
  handleCandle(candle) {
    // Обновить текущую свечу
    this.currentCandle = candle;
    this.lastCandles.push(candle);
  }

  /**
   * Генерация темы события NewSignal
   *
   * @returns
   * @memberof Candlebatcher
   */
  createSubject() {
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
    return `${this.exchange}/${this.asset}/${this.currency}/${this.timeframe}/${
      this.taskId
    }.${modeToStr(this.mode)}`;
  }

  /**
   * Генерация события NewSignal
   *
   * @param {*} signal
   * @memberof Adviser
   */
  advice(signal) {
    const newSignal = {
      id: uuid(),
      dataVersion: "1.0",
      eventTime: new Date(),
      subject: this.createSubject(),
      eventType: SIGNALS_NEW_SIGNAL_EVENT,
      data: {
        AdvisorName: this.taskId,
        Exchange: this.exchange,
        Baseq: this.asset,
        Quote: this.currency,
        Action: signal.action || "NewPosition",
        Price: signal.price || 2000,
        Type: signal.type || "limit",
        Direction: signal.Direction || "sell",
        NumberOrderInRobot: signal.numberOrderInRobot || "113",
        NumberPositionInRobot: signal.numberPositionInRobot || "2",
        PercentVolume: signal.percentVolume || 0
      }
    };

    this.sendSignals.push(newSignal);
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns
   * @memberof Adviser
   */
  getCurrentState() {
    return {
      eventSubject: this.eventSubject,
      taskId: this.taskId,
      mode: this.mode,
      debug: this.debug,
      strategy: this.strategy,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: this.timeframe,
      currentCandle: this.currentCandle,
      lastCandles: this.lastCandles,
      lastSignals: this.lastSignals,
      settings: this.settings,
      variables: this.variables,
      updateRequested: this.updateRequested,
      stopRequested: this.stopRequested,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Adviser
   */
  async save() {
    this.log(`save()`);
    const state = this.getCurrentState();

    if (this.updateRequested) {
      // Обнуляем запрос на обновление параметров
      state.updateRequested = false;
    }
    if (this.stopRequested) {
      // Обнуляем запрос на остановку сервиса
      state.stopRequested = false;
    }
    // Сохраняем состояние в локальном хранилище
    const result = await saveAdviserState(this.context, state);
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Adviser
   */
  async end(status, error) {
    this.log(`end()`);
    this.setStatus(status);
    this.setError(error);
    await this.save();
  }
}

module.exports = Adviser;
