import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import VError from "verror";
import { TRADER_SERVICE } from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  ORDER_TYPE_MARKET,
  ORDER_CLOSED,
  ORDER_OPEN
} from "cpzState";
import publishEvents from "cpzEvents";
import { LOG_TRADER_EVENT, LOG_TOPIC } from "cpzEventTypes";
import { modeToStr } from "cpzUtils/helpers";
import { saveTraderState } from "../tableStorage";
import Position from "./position";
/**
 * Класс проторговщика
 *
 * @class Trader
 */
class Trader {
  /**
   * Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Идентификатор пользователя */
    this._userId = state.userId;
    /* Идентификатор советника */
    this._adviserId = state.adviserId;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
    /* Объект настроек из веб-интерфейса */
    this._settings = state.settings || {};
    /* Код биржи */
    this._exchange = state.exchange;
    /* Идентификатор биржи */
    this._exchangeId = state.exchangeId;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Шаг проскальзывания */
    this._slippageStep = state.slippageStep;
    /* Отклонение цены */
    this._deviation = state.deviation;
    /* Объем */
    this._volume = state.volume;
    /* Текущий сигнал */
    this._signal = {};
    /* Последнтй сигнал */
    this._lastSignal = state.lastSignal || {};
    /* Объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false */
    this._updateRequested = state.updateRequested || false;
    /* Признак запроса на остановку сервиса [true,false] */
    this._stopRequested = state.stopRequested || false;
    /* Текущий статус сервиса */
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = state.startedAt || dayjs().toJSON();
    /* Дата и время остановки */
    this._endedAt = this._stopRequested
      ? dayjs().toJSON()
      : state.endedAt || "";
    /* Признак выполнения инициализации */
    this._initialized = state.initialized || false;
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof  Trader
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Trader
   */
  get updateRequested() {
    return this._updateRequested;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Trader
   */
  set status(status) {
    if (status) this._status = status;
    if (this._status === STATUS_STOPPED || this._status === STATUS_FINISHED)
      this._endedAt = dayjs().toJSON();
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Trader
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Trader ${this._eventSubject}:`, ...args);
    }
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Trader
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(this._context, LOG_TOPIC, {
      service: TRADER_SERVICE,
      subject: this._eventSubject,
      eventType: LOG_TRADER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  /**
   * Аварийная остановка проторговщика
   *
   * @param {*} msg
   * @memberof Trader
   */
  crash(msg) {
    this.log("crash()");
    throw new VError(
      {
        name: "TraderCrachError"
      },
      'Critical error while executing trader "%s" for user "%d" - "%f"',
      this._taskId,
      this._userId,
      msg
    );
  }

  /**
   * Создание новой позиции
   *
   * @memberof Trader
   */
  _createPosition() {
    this._currentPosition = new Position({
      robotId: this._taskId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      slippageStep: this._signal.settings.slippageStep || this._slippageStep,
      deviation: this._signal.settings.deviation
    });
  }

  /**
   * Загрузка новой позиции
   *
   * @memberof Trader
   */
  _loadPosition() {}

  /**
   * Обработка нового сигнала
   *
   * @param {*} signal
   * @memberof Trader
   */
  async handleSignal(signal) {
    try {
      this.log("handleSignal()");
      // Обновить текущий сигнал
      this._signal = signal;
      // Если сигнал уже обрабатывалась - выходим
      if (this._signal.signalId === this._lastSignal.signalId) return;

      if (
        this._signal.action === TRADE_ACTION_LONG ||
        this._signal.action === TRADE_ACTION_SHORT
      ) {
        this._createPosition();
        this._currentPosition.createOpenOrder(this._signal);
      } else {
        this._loadPosition();
        this._currentPosition.createCloseOrder(this._signal);
      }
      // TODO: если нужно исполнить ордер по рынку то сразу его исполянем
      // Обработанный сигнал
      this._lastSignal = this._signal;
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            adviserId: this._adviserId,
            userId: this._userId,
            eventSubject: this._eventSubject
          }
        },
        'Error while handling signal trader "%s" for user "%d"',
        this._taskId,
        this._userId
      );
    }
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Trader
   */
  getCurrentState() {
    return {
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      mode: this._mode,
      debug: this._debug,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      slippageStep: this._slippageStep,
      deviation: this._deviation,
      volume: this._volume,
      lastSignal: this._lastSignal,
      updateRequested: this._updateRequested,
      stopRequested: this._stopRequested,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata
    };
  }

  /**
   * Установка новых параметров
   *
   * @param {object} [updatedFields=this._updateRequested]
   * @memberof Trader
   */
  setUpdate(updatedFields = this._updateRequested) {
    this.log(`setUpdate()`, updatedFields);
    this._eventSubject = updatedFields.eventSubject || this._eventSubject;
    this._debug = updatedFields.debug || this._debug;
    this._slippageStep = updatedFields.slippageStep || this._slippageStep;
    this._deviation = updatedFields.deviation || this._deviation;
    this._volume = updatedFields.volume || this._volume;
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Trader
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveTraderState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            userId: this._userId,
            adviserId: this._adviserId,
            eventSubject: this._eventSubject
          }
        },
        'Failed to update trader "%s" state',
        this._taskId
      );
    }
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Trader
   */
  async end(status, error) {
    try {
      this.log(`end()`);
      this._status = status;
      this._error = error;
      this._updateRequested = false; // Обнуляем запрос на обновление параметров
      this._stopRequested = false; // Обнуляем запрос на остановку сервиса

      await this.save();
    } catch (err) {
      if (err instanceof VError) {
        throw err;
      } else {
        throw new VError(
          {
            name: "TraderError",
            cause: error
          },
          'Failed to end trader "%s" execution',
          this._taskId
        );
      }
    }
  }
}

export default Trader;