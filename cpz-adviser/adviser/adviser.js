const uuid = require("uuid").v4;
const dayjs = require("dayjs");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  SIGNALS_NEW_SIGNAL_EVENT,
  LOG_EVENT,
  CANDLESCACHED_LIMIT
} = require("../config");
const BaseStrategy = require("./baseStrategy");
const { getCachedCandlesByKey, saveAdviserState } = require("../tableStorage");
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
    this._context = context; // текущий контекст выполнения
    this._eventSubject = state.eventSubject; // тема события
    this._taskId = state.taskId; // уникальный идентификатор задачи
    this._robotId = state.robotId; // идентификатор робота
    this._mode = state.mode; // режим работы ['backtest', 'emulator', 'realtime']
    this._debug = state.debug; // режима дебага [true,false]
    this._settings = state.settings || {}; // объект настроек из веб-интерфейса
    this._exchange = state.exchange; // код биржи
    this._asset = state.asset; // базовая валюта
    this._currency = state.currency; // котировка валюты
    this._timeframe = state.timeframe; // таймфрейм
    this._strategyName = state.strategyName; // имя файла стратегии
    this._requiredHistoryCache = state.requiredHistoryCache || true; // загружать историю из кэша
    this._requiredHistoryMaxBars =
      state.requiredHistoryMaxBars || CANDLESCACHED_LIMIT; // максимально количество свечей в кэше
    this._strategy = state.strategy || { variables: {} }; // состояне стратегии
    this._indicators = state.indicators || {}; // состояние индикаторов
    this._candle = {}; // текущая свеча
    this._lastCandle = state.lastCandle || {}; // последняя свеча
    this._indicators = state.indicators || {}; // индикаторы
    this._signals = []; // массив сигналов к отправке
    this._lastSignals = state.lastSignals || []; // массив последних сигналов
    this._updateRequested = state.updateRequested || false; // объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false
    this._stopRequested = state.stopRequested || false; // признак запроса на остановку сервиса [true,false]
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED; // текущий статус сервиса
    this._startedAt = state.startedAt || dayjs().toJSON(); //  Дата и время запуска
    this._endedAt =
      state.endedAt || this._status === STATUS_STOPPED ? dayjs().toJSON() : ""; // Дата и время остановки
    this._initialized = state.initialized || false;
    this.loadStrategy();
    this.loadIndicators();
    if (!this._initialized) {
      this.initStrategy();

      this._initialized = true;
    }
  }

  /**
   * Загрузка стратегии
   *
   * @memberof Adviser
   */
  loadStrategy() {
    try {
      // Считываем класс стратегии
            this._StrategyClass = require(`../strategies/${this._strategyName}`); // eslint-disable-line
      // Создаем новый инстанс класса стратегии
      this._strategyInstance = new this._StrategyClass({
        context: this._context,
        initialized: this._strategy._initialized,
        settings: this._settings,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        advice: this.advice.bind(this), // функция advise -> adviser.advise
        log: this.log.bind(this), // функция log -> advise.log
        logEvent: this.logEvent.bind(this), // функция logEvent -> advise.logEvent
        ...this._strategy // предыдущий стейт стратегии
      });
      // Если инстанс стратегии не наследуется от BaseStrategy - ошибка
      if (!(this._strategyInstance instanceof BaseStrategy))
        throw new Error(
          `Strategy ${this._strategyName} class must extend BaseStrategy.`
        );
    } catch (error) {
      throw new Error(`Load strategy "${this._strategyName} error:"\n${error}`);
    }
  }
  /**
   *  Загрузка индикаторов
   *
   * @memberof Adviser
   */
  loadIndicators() {
    this._context.log("loadIndicators");
    try {
      Object.keys(this._indicators).forEach(key => {
        try {
                    const IndicatorClass = require(`../indicators/${this._indicators[key].fileName}`); //eslint-disable-line
          this[`_${key}Instance`] = new IndicatorClass({
            context: this._context,
            name: this._indicators[key].name,
            indicatorName: this._indicators[key].indicatorName,
            initialized: this._indicators[key].initialized,
            settings: this._indicators[key].settings,
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: this._timeframe,
            options: this._indicators[key].options,
            log: this.log.bind(this), // функция log -> advise.log
            logEvent: this.logEvent.bind(this), // функция logEvent -> advise.logEvent
            ...this._indicators[key]
          });
        } catch (err) {
          throw new Error(`Can't load indicator ${key} error:\n${err}`);
        }
      });
    } catch (error) {
      throw new Error(
        `Load indicators "${this._strategyName} error:"\n${error}`
      );
    }
  }
  /**
   * Инициализация стратегии
   *
   * @memberof Adviser
   */
  initStrategy() {
    this._context.log("initStrategy");
    try {
      // Если стратегия еще не проинициализирована
      if (!this._strategyInstance.initialized) {
        // Инициализируем
        this._strategyInstance.init();
        this._strategyInstance.initialized = true;
        // Считываем настройки индикаторов
        this._indicators = this._strategyInstance.indicators;
        this._context.log(this._indicators);
        // Загружаем индикаторы
        this.loadIndicators();
        // Инициализируем индикаторы
        this.initIndicators();
      }
    } catch (error) {
      throw new Error(`Init strategy "${this._strategyName} error:"\n${error}`);
    }
  }

  /**
   * Инициализация индикаторов
   *
   * @memberof Adviser
   */
  initIndicators() {
    this._context.log("initIndicators");
    try {
      Object.keys(this._indicators).forEach(key => {
        try {
          if (!this[`_${key}Instance`].initialized) {
            this[`_${key}Instance`].init();
            this[`_${key}Instance`].initialized = true;
          }
        } catch (err) {
          throw new Error(`Can't initialize indicator ${key} error:\n${err}`);
        }
      });
    } catch (error) {
      throw new Error(
        `Init indicators "${this._strategyName} error:"\n${error}`
      );
    }
  }
  /**
   * Пересчет индикаторов
   *
   * @memberof Adviser
   */
  async calcIndicators() {
    this._context.log("calcIndicators");
    try {
      await Promise.all(
        Object.keys(this._indicators).map(async key => {
          this[`_${key}Instance`].handleCandle(
            this._candle,
            this._candles,
            this._candlesProps
          );
          await this[`_${key}Instance`].calc();
        })
      );
    } catch (error) {
      throw new Error(
        `Calculate indicators "${this._strategyName} error:"\n${error}`
      );
    }
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Adviser ${this._eventSubject}:`, ...args);
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
      this._context,
      "log",
      createEvents({
        subject: this._eventSubject,
        eventType: LOG_EVENT,
        data: {
          taskId: this._taskId,
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
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Adviser
   */
  get updateRequested() {
    return this._updateRequested;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Adviser
   */
  set status(status) {
    if (status) this._status = status;
  }

  /**
   * Установка новых параметров
   *
   * @param {*} [updatedFields=this.updateRequested]
   * @memberof Adviser
   */
  setUpdate(updatedFields = this._updateRequested) {
    this.log(`setUpdate()`, updatedFields);
    this._debug = updatedFields.debug;
    this._settings = updatedFields.settings;
  }

  /**
   * Загрузка свечей из кэша
   *
   * @memberof Adviser
   */
  async _loadCandles() {
    const result = await getCachedCandlesByKey(
      this._context,
      `${this._exchange}.${this._asset}.${this._currency}.${this._timeframe}`,
      this._requiredHistoryMaxBars
    );
    if (result.isSuccess) {
      this._candles = result.data.reverse();
    } else {
      throw result.error;
    }
  }
  /**
   * Преобразование свечей для индикаторов
   *
   * @memberof Adviser
   */
  _prepareCandles() {
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._candles.forEach(candle => {
      this._candlesProps.open.push(candle.open);
      this._candlesProps.high.push(candle.high);
      this._candlesProps.low.push(candle.low);
      this._candlesProps.close.push(candle.close);
      this._candlesProps.volume.push(candle.volume);
    });
  }

  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Adviser
   */
  async handleCandle(candle) {
    try {
      this.log("handleCandle");
      // TODO: Проверить что эта свеча еще не обрабатывалась
      // Обновить текущую свечу
      this._candle = candle;
      // Если нужна история
      if (this._requiredHistoryCache) {
        // Загрузить свечи из кеша
        await this._loadCandles();
      } else {
        // Обрабатываем только текущую свечу
        this._candles.push(this._candle);
      }
      // Подготовить свечи для индикаторов
      this._prepareCandles();
      // Рассчитать значения индикаторов
      await this.calcIndicators();
      // Считать текущее состояние индикаторов
      this.getIndicatorsState();
      // Передать свечу и значения индикаторов в инстанс стратегии
      this._strategyInstance.handleCandle(this._candle, this._indicators);
      // Запустить проверку стратегии
      this._strategyInstance.check();
      // TODO: Отдельный метод check с отловом ошибок?
    } catch (error) {
      this._context.log.error(error);
      throw error;
    }
  }

  /**
   * Генерация темы события NewSignal
   *
   * @returns subject
   * @memberof Candlebatcher
   */
  _createSubject() {
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
    return `${this._exchange}/${this._asset}/${this._currency}/${
      this._timeframe
    }/${this._taskId}.${modeToStr(this._mode)}`;
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
      subject: this._createSubject(),
      eventType: SIGNALS_NEW_SIGNAL_EVENT,
      data: {
        id: uuid(),
        robotId: this._robotId,
        advisorId: this._taskId,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        ...signal
      }
    };

    this._signals.push(newSignal);
  }

  /**
   * Запрос текущих событий для отправки
   *
   * @memberof Adviser
   */
  get events() {
    return this._signals;
  }

  /**
   * Запрос текущего состояния индикаторов
   *
   * @memberof Adviser
   */
  getIndicatorsState() {
    try {
      Object.keys(this._indicators).forEach(ind => {
        this._indicators[ind].initialized = this[`_${ind}Instance`].initialized;
        this._indicators[ind].options = this[`_${ind}Instance`].options;
        // Все свойства инстанса стратегии
        Object.keys(this[`_${ind}Instance`])
          .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
          .forEach(key => {
            if (typeof this[`_${ind}Instance`][key] !== "function")
              this._indicators[ind].variables[key] = this[`_${ind}Instance`][
                key
              ]; // сохраняем каждое свойство
          });
      });
    } catch (error) {
      throw new Error(
        `Can't find indicators state for strategy "${
          this._strategyName
        }" \n${error}`
      );
    }
  }

  /**
   * Запрос текущего состояния стратегии
   *
   * @memberof Adviser
   */
  getStrategyState() {
    try {
      this._strategy._initialized = this._strategyInstance.initialized;
      // Все свойства инстанса стратегии
      Object.keys(this._strategyInstance)
        .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
        .forEach(key => {
          if (typeof this._strategyInstance[key] !== "function")
            this._strategy.variables[key] = this._strategyInstance[key]; // сохраняем каждое свойство
        });
    } catch (error) {
      throw new Error(
        `Can't find strategy state "${this._strategyName}" \n${error}`
      );
    }
  }
  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Adviser
   */
  get currentState() {
    this.getIndicatorsState();
    this.getStrategyState();
    return {
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      mode: this._mode,
      debug: this._debug,
      settings: this._settings,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      lastCandle: this._lastCandle,
      lastSignals: this._lastSignals,
      strategyName: this._strategyName,
      strategy: this._strategy,
      indicators: this._indicators,
      updateRequested: this._updateRequested,
      stopRequested: this._stopRequested,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Adviser
   */
  async save() {
    this.log(`save()`);
    // Сохраняем состояние в локальном хранилище
    const result = await saveAdviserState(this._context, this.currentState);
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
    this._status = status;
    this._error = error;
    this._updateRequested = false; // Обнуляем запрос на обновление параметров
    this._stopRequested = false; // Обнуляем запрос на остановку сервиса
    this._lastSignals = this._signals;
    this._lastCandle = this._candle;
    await this.save();
  }
}

module.exports = Adviser;
