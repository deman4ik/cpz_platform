import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";

import {
  createCachedCandleSlug,
  createImporterSlug,
  STATUS_ERROR,
  STATUS_FINISHED,
  STATUS_STARTED,
  VALID_TIMEFRAMES
} from "cpz/config/state";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import { saveCandlesArrayToCache } from "cpz/tableStorage-client/market/candles";
import { saveImporterState } from "cpz/tableStorage-client/control/importers";
import { generateCandleRowKey } from "cpz/utils/candlesUtils";
import {
  TASKS_IMPORTER_FINISHED_EVENT,
  TASKS_IMPORTER_STARTED_EVENT
} from "cpz/events/types/tasks/importer";
import { getCandlesDB } from "cpz/db-client/candles";
import { ERROR_IMPORTER_ERROR_EVENT } from "cpz/events/types/error";
import { combineImporterSettings } from "cpz/utils/settings";

class CacheWarmer {
  constructor(state) {
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    this._PartitionKey =
      state.PartitionKey ||
      createImporterSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency
      });
    /* Генерируемые таймфреймы [1, 5, 15, 30, 60, 120, 240, 1440] */
    this._timeframes = state.timeframes || VALID_TIMEFRAMES;
    this._mode = state.mode;
    const { debug, warmupCache } = combineImporterSettings(state.settings);
    this._settings = {
      debug,
      ...warmupCache
    };
    this._currentDate = dayjs
      .utc()
      .startOf("minute")
      .toISOString();
    this._status = STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = dayjs.utc().toISOString();
    /* Дата и время остановки */
    this._endedAt = null;
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  log(...args) {
    if (this._settings.debug) {
      Log.debug(`CacheWarmer ${this._PartitionKey}:`, ...args);
    }
  }

  async execute() {
    try {
      await EventGrid.publish(TASKS_IMPORTER_STARTED_EVENT, {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      });
      await Promise.all(
        this._timeframes.map(async timeframe => {
          let barsToCache;
          ({ barsToCache } = this._settings);
          if (timeframe === 1) barsToCache = Math.max(...this._timeframes);

          const candlesFromDb = await getCandlesDB({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe,
            dateTo: this._currentDate,
            orderBy: "{ timestamp: desc }",
            limit: barsToCache
          });

          const candles = candlesFromDb
            .map(candle => ({
              ...candle,
              PartitionKey: createCachedCandleSlug({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe
              }),
              RowKey: generateCandleRowKey(candle.time)
            }))
            .reverse();

          await saveCandlesArrayToCache(candles);
        })
      );

      this._endedAt = dayjs.utc().toISOString();
      this._status = STATUS_FINISHED;

      await this.save();
      const duration = dayjs
        .utc(this._endedAt)
        .diff(dayjs.utc(this._startedAt), "minute");
      this.log(`Finished warming cache in ${duration} minutes!!!`);

      await EventGrid.publish(TASKS_IMPORTER_FINISHED_EVENT, {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      });
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.IMPORTER_ERROR,
          cause: e,
          info: {
            critical: true,
            ...this.props
          }
        },
        "Failed to execute importer"
      );
      Log.exception(error);
      // Если есть экземпляр класса
      this._status = STATUS_ERROR;
      this._error = error.json;
      await this.save();
      // Публикуем событие - ошибка
      await EventGrid.publish(ERROR_IMPORTER_ERROR_EVENT, {
        subject: this._taskId,
        data: {
          taskId: this._taskId,
          error: error.json
        }
      });
    }
  }

  get state() {
    return {
      PartitionKey: this._PartitionKey,
      RowKey: this._taskId,
      taskId: this._taskId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      mode: this._mode,
      settings: this._settings,
      status: this._status,
      error: this._error,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      metadata: this._metadata
    };
  }

  async save() {
    try {
      await saveImporterState(this.state);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.IMPORTER_SAVE_STATE_ERROR,
          cause: e,
          info: {
            ...this.props
          }
        },
        `Failed to save importer state`
      );
    }
  }
}

export default CacheWarmer;
