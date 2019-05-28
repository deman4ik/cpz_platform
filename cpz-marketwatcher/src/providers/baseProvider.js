import cron from "node-cron";
import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import {
  createCachedCandleSlug,
  STATUS_PENDING,
  VALID_TIMEFRAMES
} from "cpz/config/state";
import { currentCandleEX } from "cpz/connector-client/candles";
import { getCurrentSince } from "cpz/utils/helpers";
import { saveMarketwatcherState } from "cpz/tableStorage-client/control/marketwatchers";
import { saveCurrentCandle } from "cpz/tableStorage-client/market/candles";
import { saveCachedTick } from "cpz/tableStorage-client/market/ticks";
import { TICKS_NEWTICK_EVENT } from "cpz/events/types/ticks";
import { ERROR_MARKETWATCHER_ERROR_EVENT } from "cpz/events/types/error";
import { getCurrentTimeframes } from "../utils/helpers";

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

    this._trades = {};
    this._candles = {};

    this._cronTask = cron.schedule(
      "* * * * * *",
      async () => {
        // Текущие дата и время - минус одна секунда
        const date = dayjs.utc().add(-1, "second");
        // Есть ли подходящие по времени таймфреймы
        const currentTimeframes = getCurrentTimeframes(VALID_TIMEFRAMES, date);
        // Если есть
        if (currentTimeframes.length > 0) {
          // Сброс текущих свечей
          currentTimeframes.forEach(timeframe => {
            Object.keys(this._candles).forEach(key => {
              const { close } = this._candles[key][timeframe];
              this._candles[key][timeframe].id = uuid();
              this._candles[key][timeframe].time = date
                .startOf("minute")
                .valueOf();
              this._candles[key][timeframe].timestamp = date
                .startOf("minute")
                .toISOString();
              this._candles[key][timeframe].high = close;
              this._candles[key][timeframe].low = close;
              this._candles[key][timeframe].open = close;
              this._candles[key][timeframe].volume = 0;
            });
          });
        }
        // Для каждой валютной пары
        await Promise.all(
          Object.keys(this._trades).map(async key => {
            // Запрашиваем все прошедшие трейды
            const trades = this._trades[key].filter(
              ({ time }) => time <= date.valueOf()
            );
            // Если были трейды
            if (trades.length > 0) {
              // Оставляем остальные трейды
              this._trades[key] = this._trades[key].filter(
                ({ time }) => time > date.valueOf()
              );
              await Promise.all(
                VALID_TIMEFRAMES.map(async timeframe => {
                  const dateFrom = getCurrentSince(1, timeframe);
                  const currentTrades = trades.filter(
                    ({ time }) => time >= dateFrom
                  );
                  if (currentTrades.length > 0) {
                    this._candles[key][timeframe].high = Math.max(
                      this._candles[key][timeframe].high,
                      ...currentTrades.map(t => +t.price)
                    );
                    this._candles[key][timeframe].low = Math.min(
                      this._candles[key][timeframe].low,
                      ...currentTrades.map(t => +t.price)
                    );
                    this._candles[key][timeframe].close = +currentTrades[
                      currentTrades.length - 1
                    ].price;
                    this._candles[key][timeframe].volume += +currentTrades
                      .map(t => t.volume)
                      .reduce((a, b) => a + b);
                    await this._saveCandleToCache(
                      this._candles[key][timeframe]
                    );
                  }
                })
              );
            }
          })
        );
      },
      {
        scheduled: false
      }
    );
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

  /* eslint-disable */
  async start() {}

  async stop() {}

  async subscribe() {}

  async unsubscribe() {}

  /* eslint-enable */

  async _loadCurrentCandles(subscriptions) {
    await Promise.all(
      subscriptions.map(async sub => {
        await Promise.all(
          VALID_TIMEFRAMES.map(async timeframe => {
            const params = {
              exchange: this._exchange,
              asset: sub.asset,
              currency: sub.currency,
              timeframe
            };
            const slug = createCachedCandleSlug(params);
            const candle = await currentCandleEX(params);
            this._candles[`${sub.asset}/${sub.currency}`][timeframe] = {
              PartitionKey: slug,
              RowKey: slug,
              id: uuid(),
              ...candle
            };
          })
        );
      })
    );
  }

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

  _saveTrade(trade) {
    this._trades[`${trade.asset}/${trade.currency}`].push(trade);
  }

  async _saveTradeToCache(trade) {
    try {
      await saveCachedTick(trade);
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

  async _saveCandleToCache(candle) {
    try {
      await saveCurrentCandle(candle);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SAVE_CANDLE_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Failed to save candle - task "%s"',
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
