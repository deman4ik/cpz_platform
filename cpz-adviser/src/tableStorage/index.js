import azure from "azure-storage";
import VError from "verror";

import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import {
  STORAGE_ADVISERS_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE
} from "cpzStorageTables";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  queryEntities
} from "cpzStorage/storage";
import { objectToEntity, createAdviserSlug } from "cpzStorage/utils";
import { modeToStr, generateKey } from "cpzUtils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_ADVISERS_TABLE);
createTableIfNotExists(STORAGE_CANDLESPENDING_TABLE);
createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);
createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);
/**
 * Сохранение состояния советника
 *
 * @param {*} state
 * @returns
 */
async function saveAdviserState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createAdviserSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    // TODO: отдельно хранить стейт советника, стратегии и индикаторов
    await insertOrMergeEntity(STORAGE_ADVISERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save adviser state"
    );
  }
}

/**
 * Сохранение состояния бэктеста
 *
 * @param {*} state
 * @returns
 */
async function saveBacktesterState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createAdviserSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_BACKTESTS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "BacktesterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save backtester state"
    );
  }
}
/**
 * Сохранение свечи ожидающих обработки
 *
 * @param {*} candle
 * @returns
 */
async function savePendingCandle(candle) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(candle.taskId),
      RowKey: entityGenerator.String(candle.id.toString()),
      ...objectToEntity(candle)
    };
    await insertOrMergeEntity(STORAGE_CANDLESPENDING_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          candle
        }
      },
      'Failed to save candle to "%s"',
      STORAGE_CANDLESPENDING_TABLE
    );
  }
}

/**
 * Сохранение свечей в кэш
 * @param {*} candle
 */
async function saveBacktesterItem(item) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(`${item.taskId}`),
      RowKey: entityGenerator.String(generateKey()),
      ...objectToEntity(item)
    };
    await insertOrMergeEntity(STORAGE_BACKTESTITEMS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          item
        }
      },
      'Failed to save candle to "%s"',
      STORAGE_BACKTESTITEMS_TABLE
    );
  }
}

/**
 * Обновление состояния советника
 *
 * @param {*} state
 * @returns
 */
async function updateAdviserState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_ADVISERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update adviser state"
    );
  }
}

/**
 * Удаление свечи ожидающей выполнения
 *
 * @param {*} candle
 * @returns
 */
async function deletePendingCandle(candle) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(candle.taskId),
      RowKey: entityGenerator.String(candle.id.toString()),
      ...objectToEntity(candle)
    };
    await deleteEntity(STORAGE_CANDLESPENDING_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          candle
        }
      },
      'Failed to delete candle from "%s"',
      STORAGE_CANDLESPENDING_TABLE
    );
  }
}

/**
 * Поиск советника по уникальному ключу
 *
 * @param {object} keys
 * @returns
 */
async function getAdviserByKey(keys) {
  try {
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.EQUAL,
      keys.rowKey
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      keys.partitionKey
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        rowKeyFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await queryEntities(STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read adviser state "%s", "%d"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск запущенных или занятых советников по бирже+инструменту+таймфрейму
 *
 * @param {string} slug
 * @returns
 */
async function getAdvisersBySlug(slug) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const busyStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_BUSY
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      busyStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await queryEntities(STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          slug
        }
      },
      'Failed to read advisers by slug "%s"',
      slug
    );
  }
}

/**
 * Отбор закешированныз свечей по ключу
 *
 * @param {string} key
 * @returns
 */
async function getCachedCandlesByKey(key, limit) {
  try {
    const query = new TableQuery()
      .where(
        TableQuery.stringFilter(
          "PartitionKey",
          TableUtilities.QueryComparisons.EQUAL,
          key
        )
      )
      .top(limit);
    return await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          key
        }
      },
      'Failed to read cached candles by key "%s"',
      key
    );
  }
}

/**
 * Поиск свечей ожидающих обработки для конкретного советника
 *
 * @param {string} id
 * @returns
 */
async function getPendingCandlesByAdviserId(id) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        id
      )
    );
    return await queryEntities(STORAGE_CANDLESPENDING_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          id
        }
      },
      'Failed to read pending candles by adviser id "%s"',
      id
    );
  }
}
export {
  saveAdviserState,
  savePendingCandle,
  saveBacktesterState,
  saveBacktesterItem,
  updateAdviserState,
  deletePendingCandle,
  getAdviserByKey,
  getAdvisersBySlug,
  getCachedCandlesByKey,
  getPendingCandlesByAdviserId
};
