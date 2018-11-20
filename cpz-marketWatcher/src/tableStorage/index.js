import azure from "azure-storage";
import VError from "verror";

import {
  STATUS_STOPPED,
  createMarketwatcherSlug,
  createCachedTickSlug
} from "cpzState";
import {
  STORAGE_MARKETWATCHERS_TABLE,
  STORAGE_TICKSCACHED_TABLE
} from "cpzStorageTables";
import tableStorage from "cpzStorage";

import { modeToStr, generateKey } from "cpzUtils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_MARKETWATCHERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_TICKSCACHED_TABLE);
/**
 * Сохранение состояния наблюдателя за рынком
 *
 * @param {*} state
 * @returns
 */
async function saveMarketwatcherState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createMarketwatcherSlug(state.hostId, modeToStr(state.mode))
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.insertOrMergeEntity(
      STORAGE_MARKETWATCHERS_TABLE,
      entity
    );
  } catch (error) {
    throw new VError(
      {
        name: "MarketwatcherStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save marketwatcher state"
    );
  }
}

/**
 * Сохранение тика в кэш
 *
 * @param {*} candle
 * @returns
 */
async function saveCachedTick(tick) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createCachedTickSlug(
          tick.exchange.toLowerCase(),
          tick.asset,
          tick.currency,
          modeToStr(tick.mode)
        )
      ),
      RowKey: entityGenerator.String(generateKey(tick.tickId)),
      ...tableStorage.objectToEntity(tick)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_TICKSCACHED_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "MarketwatcherStorageError",
        cause: error,
        info: {
          tick
        }
      },
      'Failed to save tick to "%s"',
      STORAGE_TICKSCACHED_TABLE
    );
  }
}

/**
 * Поиск наблюдателя за рынком по уникальному ключу
 *
 * @param {object} keys
 * @returns
 */
async function getMarketwatcherByKey(keys) {
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
    return await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new VError(
      {
        name: "MarketwatcherStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read marketwatcher state "%s", "%s"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск наблюдателя за рынком по идентификатору хоста
 *
 * @param {object} keys
 * @returns
 */
async function getMarketwatcherByHostId(hostId) {
  try {
    const statusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STOPPED
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      hostId
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        statusFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new VError(
      {
        name: "MarketwatcherStorageError",
        cause: error,
        info: {
          hostId
        }
      },
      'Failed to read marketwatcher state "%s"',
      hostId
    );
  }
}

export {
  saveMarketwatcherState,
  saveCachedTick,
  getMarketwatcherByKey,
  getMarketwatcherByHostId
};
