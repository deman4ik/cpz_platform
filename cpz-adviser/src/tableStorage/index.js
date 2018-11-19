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
import tableStorage from "cpzStorage";
import { modeToStr } from "cpzUtils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_ADVISERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_CANDLESPENDING_TABLE);
tableStorage.createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);
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
        tableStorage.createAdviserSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...tableStorage.objectToEntity(state)
    };
    // TODO: отдельно хранить стейт советника, стратегии и индикаторов
    await tableStorage.insertOrMergeEntity(STORAGE_ADVISERS_TABLE, entity);
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
 * Сохранение свечи ожидающих обработки
 *
 * @param {*} candle
 * @returns
 */
async function savePendingCandle(candle) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(candle.taskId),
      RowKey: entityGenerator.String(candle.candleId.toString()),
      ...tableStorage.objectToEntity(candle)
    };
    await tableStorage.insertOrMergeEntity(
      STORAGE_CANDLESPENDING_TABLE,
      entity
    );
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
 * Обновление состояния советника
 *
 * @param {*} state
 * @returns
 */
async function updateAdviserState(state) {
  try {
    const entity = {
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.mergeEntity(STORAGE_ADVISERS_TABLE, entity);
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
      RowKey: entityGenerator.String(candle.candleId.toString()),
      ...tableStorage.objectToEntity(candle)
    };
    await tableStorage.deleteEntity(STORAGE_CANDLESPENDING_TABLE, entity);
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
    return await tableStorage.queryEntities(STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read adviser state "%s", "%s"',
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
async function getAdvisersBySlug(input) {
  try {
    const { exchange, asset, currency, timeframe, mode, modeStr } = input;
    const slug = tableStorage.createAdviserSlug(
      exchange,
      asset,
      currency,
      timeframe,
      modeStr || modeToStr(mode)
    );
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
    return await tableStorage.queryEntities(STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: input
      },
      "Failed to read advisers by slug"
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
    return await tableStorage.queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
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
    return await tableStorage.queryEntities(
      STORAGE_CANDLESPENDING_TABLE,
      query
    );
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
  updateAdviserState,
  deletePendingCandle,
  getAdviserByKey,
  getAdvisersBySlug,
  getCachedCandlesByKey,
  getPendingCandlesByAdviserId
};
