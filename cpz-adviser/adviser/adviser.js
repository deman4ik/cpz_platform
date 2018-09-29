const uuid = require("uuid").v4;
const dayjs = require("dayjs");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  SIGNALS_NEW_SIGNAL_EVENT,
  LOG_EVENT
} = require("../config");
const BaseStrategy = require("./baseStrategy");
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
    this.robotId = state.robotId; // идентификатор робота
    this.mode = state.mode; // режим работы ['backtest', 'emulator', 'realtime']
    this.debug = state.debug; // режима дебага [true,false]
    this.settings = state.settings || {}; // объект настроек из веб-интерфейса
    this.exchange = state.exchange; // код биржи
    this.asset = state.asset; // базовая валюта
    this.currency = state.currency; // котировка валюты
    this.timeframe = state.timeframe; // таймфрейм
    this.strategy = state.strategy; // имя файла стратегии
    this.strategyState = state.strategyState || { variables: {} }; // состояне стратегии
    this.strategyInitialized = state.strategyInitialized || false; // стратегия инициализирована
    this.candle = {}; // текущая свеча
    this.lastCandle = state.lastCandle || {}; // последняя свеча
    this.signals = []; // массив сигналов к отправке
    this.lastSignals = state.lastSignals || []; // массив последних сигналов
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
   * Инициализации стратегии
   *
   * @memberof Adviser
   */
  initStrategy() {
    try {
      // Считываем класс стратегии
            this.StrategyClass = require(`../strategies/${this.strategy}`); // eslint-disable-line
      // Создаем новый инстанс класса стратегии
      this.strategyInstance = new this.StrategyClass({
        context: this.context,
        settings: this.settings,
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        timeframe: this.timeframe,
        advice: this.advice.bind(this), // функция advise -> adviser.advise
        log: this.logEvent.bind(this), // функция log -> advise.logEvent
        ...this.strategyState // предыдущий стейт стратегии
      });
      // Если инстанс стратегии не наследуется от BaseStrategy - ошибка
      if (!(this.strategyInstance instanceof BaseStrategy))
        throw new Error(
          `Strategy ${this.strategy} class must extend BaseStrategy.`
        );
      // Если стратегия еще не проинициализирована
      if (!this.strategyInitialized) {
        // Инициализируем
        this.strategyInstance.init();
        this.strategyInitialized = true;
        // TODO: Отдельный метод init с отловом ошибок?
      }
    } catch (error) {
      throw new Error(`Init strategy "${this.strategy} error:"\n${error}`);
    }
  }

  /**
   * Запрос текущего состояния стратегии
   *
   * @memberof Adviser
   */
  getStrategyInstanceState() {
    try {
      // Все свойства инстанса стратегии
      Object.keys(this.strategyInstance)
        .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
        .forEach(key => {
          // TODO: check indicators
          this.strategyState.variables[key] = this.strategyInstance[key]; // сохраняем каждое свойство
        });
    } catch (error) {
      throw new Error(`Can't find strategy "${this.strategy}" state\n${error}`);
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
    // Публикуем событие
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
   * @returns status
   * @memberof Adviser
   */
  getStatus() {
    return this.status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
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
    this.context.log("handleCandle");
    // TODO: Проверить что эта свеча еще не обрабатывалась
    // Обновить текущую свечу
    this.candle = candle;
    // Передать свечу в инстанс стратегии
    this.strategyInstance._handleCandle(candle);
    // Запустить проверку стратегии
    this.strategyInstance.check();
    // TODO: Отдельный метод check с отловом ошибок?
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
        id: uuid(),
        robotId: this.robotId,
        advisorId: this.taskId,
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        ...signal
      }
    };

    this.signals.push(newSignal);
  }

  /**
   * Генерация темы события NewSignal
   *
   * @returns subject
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
   * Запрос текущих событий для отправки
   *
   * @memberof Adviser
   */
  getEvents() {
    return this.signals;
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Adviser
   */
  getCurrentState() {
    this.getStrategyInstanceState();
    return {
      eventSubject: this.eventSubject,
      taskId: this.taskId,
      robotId: this.robotId,
      mode: this.mode,
      debug: this.debug,
      settings: this.settings,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: this.timeframe,
      lastCandle: this.lastCandle,
      lastSignals: this.lastSignals,
      strategy: this.strategy,
      strategyState: this.strategyState,
      strategyInitialized: this.strategyInitialized,
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

    this.updateRequested = false; // Обнуляем запрос на обновление параметров
    this.stopRequested = false; // Обнуляем запрос на остановку сервиса
    this.lastSignals = this.signals;
    this.lastCandle = this.candle;
    await this.save();
  }
}

module.exports = Adviser;
