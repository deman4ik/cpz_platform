import azure from "azure-storage";
import VError from "verror";
import dayjs from "cpzDayjs";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  executeBatch,
  queryEntities
} from "cpzStorage/storage";
import { objectToEntity, createCachedCandleSlug } from "cpzStorage/utils";
import { modeToStr, chunkArray } from "cpzUtils/helpers";
import {
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESTEMP_TABLE
} from "cpzStorageTables";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);
createTableIfNotExists(STORAGE_CANDLESTEMP_TABLE);

/**
 * Сохранение одной свечи в кэш
 *
 * @param {object} candle
 */
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

/**
 * Сохранение массива свечей в указанную таблицу
 * @private
 * @param {string} table
 * @param {array} candles
 */
async function _saveCandlesArray(table, candles) {
  try {
    const chunks = chunkArray(candles, 100);
    await Promise.all(
      chunks.map(async chunk => {
        const batch = new azure.TableBatch();
        chunk.forEach(candle => {
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
        await executeBatch(table, batch);
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to save candles to "%s"',
      table
    );
  }
}

/**
 * Сохранение массива свечей в кэш
 *
 * @param {array} candles
 */
async function saveCandlesArrayToCache(candles) {
  try {
    await _saveCandlesArray(STORAGE_CANDLESCACHED_TABLE, candles);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      "Failed to save candles to cache"
    );
  }
}

/**
 * Сохранение массива свечей во временную таблицу
 *
 * @param {array} candles
 */
async function saveCandlesArrayToTemp(candles) {
  try {
    await _saveCandlesArray(STORAGE_CANDLESTEMP_TABLE, candles);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      "Failed to save candles to temp"
    );
  }
}

/**
 * Удаление массива свечей
 * @private
 * @param {Array} candles
 */
async function _deleteCandlesArray(tableName, candles) {
  try {
    const chunks = chunkArray(candles, 100);
    await Promise.all(
      chunks.map(async chunk => {
        const batch = new azure.TableBatch();
        chunk.forEach(candle => {
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
          batch.deleteEntity(objectToEntity(entity));
        });
        await executeBatch(tableName, batch);
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete candles from "%s"',
      tableName
    );
  }
}

/**
 * Удаление массива свечей из кэша
 *
 * @param {array} candles
 */
async function deleteCachedCandlesArray(candles) {
  try {
    await _deleteCandlesArray(STORAGE_CANDLESCACHED_TABLE, candles);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete candles from "%s"',
      STORAGE_CANDLESCACHED_TABLE
    );
  }
}

/**
 * Удаление массива временных свечей
 *
 * @param {Array} candles
 */
async function deleteTempCandlesArray(candles) {
  try {
    await _deleteCandlesArray(STORAGE_CANDLESTEMP_TABLE, candles);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete candles from "%s"',
      STORAGE_CANDLESTEMP_TABLE
    );
  }
}

/**
 * Удаление временных свечей по указанному taskId
 *
 * @param {string} taskId
 */
async function clearTempCandles(taskId) {
  try {
    const taskIdFilter = TableQuery.stringFilter(
      "taskId",
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const query = new TableQuery()
      .where(taskIdFilter)
      .select("PartitionKey", "RowKey");
    const candles = await queryEntities(STORAGE_CANDLESTEMP_TABLE, query);
    const chunks = chunkArray(candles, 100);
    await Promise.all(
      chunks.map(async chunk => {
        const batch = new azure.TableBatch();
        chunk.forEach(candle => {
          batch.deleteEntity(objectToEntity(candle));
        });
        await executeBatch(STORAGE_CANDLESTEMP_TABLE, batch);
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete candles from "%s"',
      STORAGE_CANDLESTEMP_TABLE
    );
  }
}

/**
 * Очистка свечей в кэше
 *
 * @param {string} taskId
 * @param {double} timeframe
 * @param {date} dateTo
 */
async function cleanCachedCandles(taskId, timeframe, dateTo) {
  try {
    const taskIdFilter = TableQuery.stringFilter(
      "taskId",
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const timeframeFilter = TableQuery.doubleFilter(
      "timeframe",
      TableUtilities.QueryComparisons.EQUAL,
      timeframe
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN,
      dayjs(dateTo).toDate()
    );
    const combinedFilters = TableQuery.combineFilters(
      timeframeFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );

    const query = new TableQuery()
      .where(
        TableQuery.combineFilters(
          taskIdFilter,
          TableUtilities.TableOperators.AND,
          combinedFilters
        )
      )
      .select("PartitionKey", "RowKey");
    const candles = await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
    const chunks = chunkArray(candles, 100);
    await Promise.all(
      chunks.map(async chunk => {
        const batch = new azure.TableBatch();
        chunk.forEach(candle => {
          batch.deleteEntity(objectToEntity(candle));
        });
        await executeBatch(STORAGE_CANDLESCACHED_TABLE, batch);
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete candles from "%s"',
      STORAGE_CANDLESCACHED_TABLE
    );
  }
}

/**
 * Запрос свечей
 * @private
 * @param {string} tableName
 * @param {object} input
 */
async function _getCandles(tableName, { dateFrom, dateTo, slug }) {
  try {
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      dayjs(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs(dateTo).toDate()
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        dateFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await queryEntities(tableName, query);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      'Failed to load candles from "%s"',
      tableName
    );
  }
}

/**
 * Запрос свечей из кэша
 *
 * @param {object} input
 */
async function getCachedCandles(input) {
  try {
    return await _getCandles(STORAGE_CANDLESCACHED_TABLE, input);
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

/**
 * Запрос временных свечей
 *
 * @param {object} input
 */
async function getTempCandles(input) {
  try {
    return await _getCandles(STORAGE_CANDLESTEMP_TABLE, input);
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

/**
 * Запрос количества свечей в кэше
 *
 * @param {object} input
 */
async function countCachedCandles({ dateFrom, dateTo, slug }) {
  try {
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      dayjs(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs(dateTo).toDate()
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const query = new TableQuery()
      .where(
        TableQuery.combineFilters(
          dateFilter,
          TableUtilities.TableOperators.AND,
          partitionKeyFilter
        )
      )
      .select("RowKey");
    const result = await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
    return result.length;
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      "Failed to count cached candles"
    );
  }
}

export {
  saveCandleToCache,
  saveCandlesArrayToCache,
  saveCandlesArrayToTemp,
  deleteCachedCandlesArray,
  deleteTempCandlesArray,
  clearTempCandles,
  cleanCachedCandles,
  getCachedCandles,
  countCachedCandles,
  getTempCandles
};
