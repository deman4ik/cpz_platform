import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import {
  STORAGE_ADVISERS_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_CANDLESCACHED_TABLE
} from "cpzStorageTables";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  queryEntities
} from "cpzStorage/storage";
import {
  objectToEntity,
  entityToObject,
  createAdviserSlug
} from "cpzStorage/utils";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_ADVISERS_TABLE);
createTableIfNotExists(STORAGE_CANDLESPENDING_TABLE);

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
          state.mode
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
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
 * Сохранение свечей ожидающих обработки
 *
 * @param {*} candle
 * @returns
 */
async function savePendingCandles(candle) {
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
async function deletePendingCandles(candle) {
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
    const result = await queryEntities(STORAGE_ADVISERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { data: entities[0] };
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
    const result = await queryEntities(STORAGE_ADVISERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { data: entities };
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
    const result = await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { data: entities };
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
    const result = await queryEntities(STORAGE_CANDLESPENDING_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { data: entities };
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
  savePendingCandles,
  updateAdviserState,
  deletePendingCandles,
  getAdviserByKey,
  getAdvisersBySlug,
  getCachedCandlesByKey,
  getPendingCandlesByAdviserId
};
