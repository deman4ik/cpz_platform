import ServiceError from "cpz/error";
import { createCurrentPriceSlug, STATUS_PENDING } from "cpz/config/state";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import { saveMarketwatcherState } from "cpz/tableStorage-client/control/marketwatchers";
import { saveCurrentPrice } from "cpz/tableStorage-client/market/currentPrices";
import { saveCachedTick } from "cpz/tableStorage-client/market/ticks";
import { TICKS_NEWTICK_EVENT } from "cpz/events/types/ticks";
import { ERROR_MARKETWATCHER_ERROR_EVENT } from "cpz/events/types/error";

class BaseProvider {
  constructor(state) {
    /* Тема события */
    this._PartitionKey = state.PartitionKey || state.exchange;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Режима дебага [true,false] */
    this._debug =
      state.debug === undefined || state.debug === null
        ? process.env.DEBUG
        : state.debug;
    /* Биржа */
    this._exchange = state.exchange;
    /* Поставщик данных */
    this._providerType = state.providerType;
    /* Список подписок */
    this._subscriptions = state.subscriptions || [];
    /* Текущий статус сервиса */
    this._status = state.status || STATUS_PENDING;
    /* Текущий статус websocker соединения */
    this._socketStatus = state.status || "none";
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  get status() {
    return this._status;
  }

  get socketStatus() {
    return this._socketStatus;
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      Log.debug(`${this._PartitionKey}:`, ...args);
    }
  }

  logInfo(...args) {
    Log.info(`${this._PartitionKey}:`, ...args);
  }

  /* eslint-disable */
  async start() {}

  async stop() {}

  async subscribe() {}

  async unsubscribe() {}

  /* eslint-enable */

  async _publishTick(tick) {
    try {
      await EventGrid.publish(TICKS_NEWTICK_EVENT, {
        subject: this._exchange,
        data: tick
      });
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_PUBLISH_TICK_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Failed to send NewTick event - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._error = error.json;
      await this._save();

      await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        error: error.json
      });
    }
  }

  async _saveTrade(tick) {
    try {
      if (tick.type === "trade") await saveCachedTick(tick);
      if (tick.type === "tick") {
        const slug = createCurrentPriceSlug({
          exchange: tick.exchange,
          asset: tick.asset,
          currency: tick.currency
        });
        await saveCurrentPrice({
          PartitionKey: slug,
          RowKey: "tick",
          time: tick.time,
          timestamp: tick.timestamp,
          price: tick.price,
          tickId: tick.tickId,
          candleId: null
        });
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SAVE_TICK_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Failed to save tick - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._error = error.json;
      await this._save();

      await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        error: error.json
      });
    }
  }

  async _save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveMarketwatcherState(this.state);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SAVE_TICK_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Failed to save marketwatcher state - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._error = error.json;
      await this._save();

      await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        error: error.json
      });
    }
  }

  get props() {
    return {
      taskId: this._taskId,
      exchange: this._exchange,
      subscriptions: this._subscriptions
    };
  }

  get state() {
    return {
      PartitionKey: this._PartitionKey,
      taskId: this._taskId,
      RowKey: this._taskId,
      debug: this._debug,
      exchange: this._exchange,
      subscriptions: this._subscriptions,
      status: this._status,
      socketStatus: this._socketStatus,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default BaseProvider;
