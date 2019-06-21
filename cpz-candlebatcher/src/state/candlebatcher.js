import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import {
  CANDLE_PREVIOUS,
  createCachedCandleSlug,
  createCandlebatcherSlug,
  createNewCandleSubject,
  STATUS_STARTED,
  STATUS_PENDING,
  STATUS_STOPPED,
  STATUS_PAUSED,
  STATUS_ERROR,
  VALID_TIMEFRAMES,
  ATTENTION_SUBJECT
} from "cpz/config/state";
import {
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT
} from "cpz/events/types/tasks/candlebatcher";
import { ERROR_CANDLEBATCHER_ERROR_EVENT } from "cpz/events/types/error";
import { combineCandlebatcherSettings } from "cpz/utils/settings";
import { generateCandleRowKey } from "cpz/utils/candlesUtils";
import { CANDLES_NEWCANDLE_EVENT } from "cpz/events/types";

/**
 * Класс Candlebatcher
 *
 * @class Candlebatcher
 */
class Candlebatcher {
  constructor(state) {
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Тип провайдера ['ccxt'] */
    this._providerType = state.providerType || "ccxt";
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Массив таймфреймов [1, 5, 15, 30, 60, 120, 240, 1440] */
    this._timeframes = state.timeframes || VALID_TIMEFRAMES;

    this._PartitionKey =
      state.PartitionKey ||
      createCandlebatcherSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency
      });
    this._settings = combineCandlebatcherSettings(state.settings);
    /* Последняя минутная свеча */
    this._lastCandle = state.lastCandle || null;
    this._lastSendedCandles = state.lastSendedCandles || [];
    /* Текущий статус сервиса */
    this._status = state.status || STATUS_PENDING;
    /* Дата и время запуска */
    this._startedAt = state.startedAt;
    this._stoppedAt = state.stoppedAt;

    this._currentDate = dayjs
      .utc()
      .startOf("minute")
      .toISOString();
    /* События для отправки */
    this._eventsToSend = {};
  }

  get taskId() {
    return this._taskId;
  }

  get events() {
    return Object.values(this._eventsToSend);
  }

  start() {
    this._status = STATUS_STARTED;
    this._startedAt = dayjs.utc().toISOString();
    this._stoppedAt = null;
    this._error = null;
    this._lastCandle = null;
    this._eventsToSend.Start = {
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  stop() {
    this._status = STATUS_STOPPED;
    this._stoppedAt = dayjs.utc().toISOString();
    this._eventsToSend.Stop = {
      eventType: TASKS_CANDLEBATCHER_STOPPED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  update(settings) {
    this._settings = combineCandlebatcherSettings(settings);
    this._eventsToSend.Update = {
      eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  pause() {
    this._status = STATUS_PAUSED;
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  get lastCandle() {
    return this._lastCandle;
  }

  createPrevCandle(time) {
    if (this._lastCandle) {
      const dateFrom = dayjs
        .utc(time)
        .startOf("minute")
        .toISOString();

      /* Формируем новую минутную свечу по данным из предыдущей */
      return {
        PartitionKey: createCachedCandleSlug({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: 1
        }),
        RowKey: generateCandleRowKey(dayjs.utc(dateFrom).valueOf()),
        id: uuid(),
        taskId: this._taskId,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: 1,
        time: dayjs.utc(dateFrom).valueOf(), // время в милисекундах
        timestamp: dayjs.utc(dateFrom).toISOString(), // время в ISO UTC
        open: this._lastCandle.close, // цена открытия = цене закрытия предыдущей
        high: this._lastCandle.close, // максимальная цена = цене закрытия предыдущей
        low: this._lastCandle.close, // минимальная цена = цене закрытия предыдущей
        close: this._lastCandle.close, // цена закрытия = цене закрытия предыдущей
        volume: 0, // нулевой объем
        type: CANDLE_PREVIOUS // признак - предыдущая
      };
    }
    return null;
  }

  handleCandle(candle) {
    if (this._lastCandle) {
      const { time } = this._lastCandle;
      if (time && time >= candle.time) {
        return false;
      }
    }
    this._lastCandle = candle;
    return true;
  }

  createCandleEvents(candlesObject) {
    this._lastSendedCandles = [];
    Object.keys(candlesObject).forEach(async timeframe => {
      const candle = candlesObject[timeframe];

      if (candle.type !== CANDLE_PREVIOUS) {
        /* Если подписаны на данный таймфрейм */
        if (this._timeframes.includes(+timeframe)) {
          this._eventsToSend[`C_${timeframe}`] = {
            eventType: CANDLES_NEWCANDLE_EVENT,
            eventData: {
              subject: createNewCandleSubject({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe
              }),
              data: candle
            }
          };
          this._lastSendedCandles.push(candle);
        }
      }
    });
  }

  _createErrorEvent(error) {
    const { critical = false } = error.info;
    return {
      eventType: ERROR_CANDLEBATCHER_ERROR_EVENT,
      eventData: {
        subject: ATTENTION_SUBJECT,
        data: {
          taskId: this._taskId,
          critical,
          error
        }
      }
    };
  }

  setError(err) {
    try {
      let critical;
      if (err instanceof ServiceError) {
        ({ critical = false } = err.info);
        this._error = err.json;
      } else {
        critical = true;
        this._error = new ServiceError(
          {
            name: ServiceError.types.CANDLEBATCHER_ERROR,
            cause: err,
            info: { ...this.props }
          },
          "Candlebatcher '%s' error",
          this._taskId
        ).json;
      }
      if (critical) this._status = STATUS_ERROR;

      this._eventsToSend.error = this._createErrorEvent(this._error);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_SET_ERROR_ERROR,
          cause: e
        },
        "Failed to set error"
      );
    }
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns
   * @memberof Candlebatcher
   */
  get state() {
    return {
      PartitionKey: this._PartitionKey,
      RowKey: this._taskId,
      taskId: this._taskId,
      providerType: this._providerType,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      settings: this._settings,
      lastCandle: this._lastCandle,
      lastSendedCandles: this._lastSendedCandles,
      status: this._status,
      error: this._error,
      startedAt: this._startedAt,
      stoppedAt: this._stoppedAt,
      currentDate: this._currentDate
    };
  }

  get props() {
    return {
      taskId: this._taskId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency
    };
  }
}

export default Candlebatcher;
