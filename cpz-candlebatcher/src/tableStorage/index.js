import azure from "azure-storage";
import VError from "verror";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  executeBatch,
  queryEntities
} from "cpzStorage/storage";
import {
  objectToEntity,
  createCandlebatcherSlug,
  createCachedCandleSlug
} from "cpzStorage/utils";
import { modeToStr } from "cpzUtils/helpers";
import {
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_IMPORTERS_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESTEMP_TABLE,
  STORAGE_TICKSCACHED_TABLE
} from "cpzStorageTables";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_CANDLEBATCHERS_TABLE);
createTableIfNotExists(STORAGE_IMPORTERS_TABLE);
createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);
createTableIfNotExists(STORAGE_TICKSCACHED_TABLE);

async function saveCandlebatcherState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createCandlebatcherSlug(
          state.exchange,
          state.asset,
          state.currency,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_CANDLEBATCHERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save candlebatcher state"
    );
  }
}

async function updateCandlebatcherState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_CANDLEBATCHERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update candlebatcher state"
    );
  }
}

async function saveImporterState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createCandlebatcherSlug(
          state.exchange,
          state.asset,
          state.currency,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_IMPORTERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save importer state"
    );
  }
}

async function updateImporterState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_IMPORTERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update importer state"
    );
  }
}

async function saveCandleToCache(candle) {
  try {
    const slug = createCachedCandleSlug(
      candle.exchange,
      candle.asset,
      candle.currency,
      candle.timeframe,
      modeToStr(candle.mode)
    );
    const entity = {
      PartitionKey: entityGenerator.String(slug),
      RowKey: entityGenerator.String(candle.id),
      ...objectToEntity(candle)
    };
    await insertOrMergeEntity(STORAGE_CANDLESCACHED_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          candle
        }
      },
      "Failed to save candle to cache"
    );
  }
}

async function saveCandlesArrayToCache(candles) {
  try {
    const batch = new azure.TableBatch();
    candles.forEach(candle => {
      const slug = createCachedCandleSlug(
        candle.exchange,
        candle.asset,
        candle.currency,
        candle.timeframe,
        modeToStr(candle.mode)
      );
      const entity = {
        PartitionKey: entityGenerator.String(slug),
        RowKey: entityGenerator.String(candle.id),
        ...objectToEntity(candle)
      };
      batch.insertOrMergeEntity(entity);
    });

    await executeBatch(STORAGE_CANDLESCACHED_TABLE, batch);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          candles
        }
      },
      "Failed to save candles to cache"
    );
  }
}
/**
 * Удаление тиков ожидающей выполнения
 *
 * @param {Array} ticks
 * @returns
 */
async function clearPrevCachedTicks(ticks) {
  try {
    await Promise.all(
      ticks.map(async tick => {
        try {
          await deleteEntity(STORAGE_TICKSCACHED_TABLE, objectToEntity(tick));
        } catch (error) {
          throw new VError(
            {
              name: "CandlebatcherStorageError",
              cause: error,
              info: {
                tick
              }
            },
            'Failed to delete tick from "%s"',
            STORAGE_TICKSCACHED_TABLE
          );
        }
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          ticks
        }
      },
      'Failed to delete ticks from "%s"',
      STORAGE_TICKSCACHED_TABLE
    );
  }
}

async function getStartedCandlebatchers() {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "status",
        TableUtilities.QueryComparisons.EQUAL,
        "started"
      )
    );
    return await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      "Failed to load started candlebatchers"
    );
  }
}

async function getCandlebatcherByKey(keys) {
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
    return await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query)[0];
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          keys
        }
      },
      "Failed to load candlebatcher by key"
    );
  }
}

async function getImporterByKey(keys) {
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
    return await queryEntities(STORAGE_IMPORTERS_TABLE, query)[0];
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          keys
        }
      },
      "Failed to load importer by key"
    );
  }
}

async function getPrevCachedTicks(input) {
  try {
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      new Date(input.dateFrom)
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      new Date(input.dateTo)
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      input.slug
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        dateFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await queryEntities(STORAGE_TICKSCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: input
      },
      "Failed to load previous ticks"
    );
  }
}

async function getCachedCandles(input) {
  try {
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      new Date(input.dateFrom.toISOString())
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      new Date(input.dateTo.toISOString())
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      input.slug
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        dateFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: input
      },
      "Failed to load cached candles"
    );
  }
}

export {
  saveCandlebatcherState,
  updateCandlebatcherState,
  saveImporterState,
  updateImporterState,
  saveCandleToCache,
  saveCandlesArrayToCache,
  clearPrevCachedTicks,
  getStartedCandlebatchers,
  getCandlebatcherByKey,
  getImporterByKey,
  getPrevCachedTicks,
  getCachedCandles
};
