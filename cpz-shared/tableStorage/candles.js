import azure from "azure-storage";
import VError from "verror";
import dayjs from "../utils/lib/dayjs";
import {
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESTEMP_TABLE
} from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_MARKET_CS);
tableStorage.createTableIfNotExists(STORAGE_CANDLESPENDING_TABLE);
tableStorage.createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);
tableStorage.createTableIfNotExists(STORAGE_CANDLESTEMP_TABLE);

/**
 * Query candles from table
 *
 * @param {string} tableName - table sotrage table name
 * @param {Object} input - input object
 * @param {Date} input.dateFrom - date from
 * @param {Date} input.dateTo - date to
 * @param {string} input.slug - slug
 * @returns {Candles[]}
 */
const _getCandles = async (tableName, { dateFrom, dateTo, slug }) => {
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
    return await tableStorage.queryEntities(tableName, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      'Failed to load candles from "%s"',
      tableName
    );
  }
};

/**
 * Query pending candles
 *
 * @param {string} adviserId - Adviser task id
 * @returns {PendingCandle[]}
 */
const getPendingCandlesByAdviserId = adviserId =>
  tableStorage.getEntitiesByPartitionKey(
    STORAGE_CANDLESPENDING_TABLE,
    adviserId
  );

/**
 * Save pending candle
 *
 * @param {PendingCandle} candle
 */
const savePendingCandle = candle =>
  tableStorage.insertOrMergeEntity(STORAGE_CANDLESPENDING_TABLE, candle);

/**
 * Delete pending candle
 *
 * @param {PendingCandle} candle
 */
const deletePendingCandle = candle =>
  tableStorage.deleteEntity(STORAGE_CANDLESPENDING_TABLE, candle);

/**
 * Query cached candles
 *
 * @param {string} key - partition key
 * @param {int} limit - query limit
 * @returns {CachedCandle[]}
 */
const getCachedCandlesByKey = async (key, limit) => {
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
        name: "TableStorageError",
        cause: error,
        info: {
          key
        }
      },
      'Failed to read cached candles by key "%s"',
      key
    );
  }
};

/**
 * Query cached candles
 *
 * @param {Object} input - input object
 * @param {Date} input.dateFrom - date from
 * @param {Date} input.dateTo - date to
 * @param {string} input.slug - slug
 * @returns {CachedCandles[]}
 */
const getCachedCandles = ({ dateFrom, dateTo, slug }) =>
  _getCandles(STORAGE_CANDLESCACHED_TABLE, { dateFrom, dateTo, slug });

/**
 * Count cached candles
 *
 * @param {Object} input - input object
 * @param {string} input.slug - slug
 * @param {Date} input.dateFrom - date from
 * @param {Date} input.dateTo - date to
 * @returns {int} - cached candles count
 */
const countCachedCandles = async ({ slug, dateFrom, dateTo }) => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
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
    const query = new TableQuery()
      .where(
        TableQuery.combineFilters(
          dateFilter,
          TableUtilities.TableOperators.AND,
          partitionKeyFilter
        )
      )
      .select("RowKey");

    return await tableStorage.countEntities(STORAGE_CANDLESCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      "Failed to count cached candles"
    );
  }
};

/**
 * Save cahed candle
 *
 * @param {CachedCandle} candle
 */
const saveCandleToCache = candle =>
  tableStorage.insertOrMergeEntity(STORAGE_CANDLESCACHED_TABLE, candle);

/**
 * Save cached candles
 *
 * @param {CachedCandle[]} candles
 */
const saveCandlesArrayToCache = candles =>
  tableStorage.insertOrMergeArray(STORAGE_CANDLESCACHED_TABLE, candles);

/**
 * Delete cached candles
 *
 * @param {CachedCandle[]} candles
 */
const deleteCachedCandlesArray = candles =>
  tableStorage.deleteArray(STORAGE_CANDLESCACHED_TABLE, candles);

/**
 * Clean outdated cached candles
 *
 * @param {Object} input
 * @param {string} input.slug - slug
 * @param {Date} input.dateTo -  delete all before this date
 */
const cleanCachedCandles = async ({ slug, dateTo }) => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN,
      dayjs(dateTo).toDate()
    );

    const query = new TableQuery()
      .where(
        TableQuery.combineFilters(
          partitionKeyFilter,
          TableUtilities.TableOperators.AND,
          dateToFilter
        )
      )
      .select("PartitionKey", "RowKey");
    const candles = await tableStorage.queryEntities(
      STORAGE_CANDLESCACHED_TABLE,
      query
    );
    await deleteCachedCandlesArray(candles);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error
      },
      'Failed to clean candles in "%s"',
      STORAGE_CANDLESCACHED_TABLE
    );
  }
};

/**
 * Query temp candles
 *
 * @param {Object} input - input object
 * @param {Date} input.dateFrom - date from
 * @param {Date} input.dateTo - date to
 * @param {string} input.slug - slug
 * @returns {TempCandle[]}
 */
const getTempCandles = ({ dateFrom, dateTo, slug }) =>
  _getCandles(STORAGE_CANDLESTEMP_TABLE, { dateFrom, dateTo, slug });

/**
 * Save temp candles
 *
 * @param {TempCandle[]} candles
 */
const saveCandlesArrayToTemp = candles =>
  tableStorage.insertOrMergeArray(STORAGE_CANDLESTEMP_TABLE, candles);

/**
 * Delete temp candles
 *
 * @param {TempCandle[]} candles
 */
const deleteTempCandlesArray = candles =>
  tableStorage.deleteArray(STORAGE_CANDLESTEMP_TABLE, candles);

/**
 * Delete all temp candles for service task id
 *
 * @param {string} taskId
 */
const clearTempCandles = async taskId => {
  try {
    const taskIdFilter = TableQuery.stringFilter(
      "taskId",
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const query = new TableQuery()
      .where(taskIdFilter)
      .select("PartitionKey", "RowKey");
    const candles = await tableStorage.queryEntities(
      STORAGE_CANDLESTEMP_TABLE,
      query
    );
    await deleteTempCandlesArray(candles);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error
      },
      'Failed to clear candles from "%s"',
      STORAGE_CANDLESTEMP_TABLE
    );
  }
};
export {
  getPendingCandlesByAdviserId,
  savePendingCandle,
  deletePendingCandle,
  getCachedCandles,
  countCachedCandles,
  getCachedCandlesByKey,
  saveCandleToCache,
  saveCandlesArrayToCache,
  deleteCachedCandlesArray,
  cleanCachedCandles,
  getTempCandles,
  saveCandlesArrayToTemp,
  deleteTempCandlesArray,
  clearTempCandles
};
