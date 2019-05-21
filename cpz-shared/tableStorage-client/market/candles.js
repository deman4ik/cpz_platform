import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import dayjs from "../../utils/dayjs";
import { CANDLE_PREVIOUS } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_CANDLESTEMP_TABLE: "CandlesTemp",
  STORAGE_CANDLESCACHED_TABLE: "CandlesCached",
  STORAGE_CANDLESCURRENT_TABLE: "CandlesCurrent"
};

/**
 * Query candles from table
 *
 * @param {string} tableName - table sotrage table name
 * @param {Object} input - input object
 *  @property {Date} input.dateFrom - date from
 *  @property {Date} input.dateTo - date to
 *  @property {string} input.slug - slug
 * @returns {Object[]}
 */
const _getCandles = async (tableName, { dateFrom, dateTo, slug }) => {
  try {
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      dayjs.utc(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs.utc(dateTo).toDate()
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
    return await client.queryEntities(tableName, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      'Failed to load candles from "%s"',
      tableName
    );
  }
};

/**
 * Query cached candles
 *
 * @param {string} key - partition key
 * @param {int} limit - query limit
 * @returns {Object[]}
 */
const getCachedCandlesByKey = async (key, limit) => {
  try {
    const query = new TableQuery()
      .where(
        TableQuery.combineFilters(
          TableQuery.stringFilter(
            "PartitionKey",
            TableUtilities.QueryComparisons.EQUAL,
            key
          ),
          TableUtilities.TableOperators.AND,
          TableQuery.stringFilter(
            "type",
            TableUtilities.QueryComparisons.NOT_EQUAL,
            CANDLE_PREVIOUS
          )
        )
      )
      .top(limit);
    return await client.queryEntities(
      TABLES.STORAGE_CANDLESCACHED_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 *  @property {Date} input.dateFrom - date from
 *  @property {Date} input.dateTo - date to
 *  @property {string} input.slug - slug
 * @returns {Object[]}
 */
const getCachedCandles = ({ dateFrom, dateTo, slug }) =>
  _getCandles(TABLES.STORAGE_CANDLESCACHED_TABLE, { dateFrom, dateTo, slug });

/**
 * Count cached candles
 *
 * @param {Object} input - input object
 *  @property {string} input.slug - slug
 *  @property {Date} input.dateFrom - date from
 *  @property {Date} input.dateTo - date to
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
      dayjs.utc(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs.utc(dateTo).toDate()
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

    return await client.countEntities(
      TABLES.STORAGE_CANDLESCACHED_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @param {Object} candle
 */
const saveCandleToCache = candle =>
  client.insertOrMergeEntity(TABLES.STORAGE_CANDLESCACHED_TABLE, candle);

/**
 * Save cached candles
 *
 * @param {Object[]} candles
 */
const saveCandlesArrayToCache = candles =>
  client.insertOrMergeArray(TABLES.STORAGE_CANDLESCACHED_TABLE, candles);

/**
 * Delete cached candles
 *
 * @param {Object[]} candles
 */
const deleteCachedCandlesArray = candles =>
  client.deleteArray(TABLES.STORAGE_CANDLESCACHED_TABLE, candles);

/**
 * Clean outdated cached candles
 *
 * @param {Object} input
 *  @property {string} input.slug - slug
 *  @property {Date} input.dateTo -  delete all before this date
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
      dayjs.utc(dateTo).toDate()
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
    const candles = await client.queryEntities(
      TABLES.STORAGE_CANDLESCACHED_TABLE,
      query
    );
    await deleteCachedCandlesArray(candles);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      'Failed to clean candles in "%s"',
      TABLES.STORAGE_CANDLESCACHED_TABLE
    );
  }
};

/**
 * Query temp candles
 *
 * @param {Object} input - input object
 *  @property {Date} input.dateFrom - date from
 *  @property {Date} input.dateTo - date to
 *  @property {string} input.slug - slug
 * @returns {Object[]}
 */
const getTempCandles = ({ dateFrom, dateTo, slug }) =>
  _getCandles(TABLES.STORAGE_CANDLESTEMP_TABLE, { dateFrom, dateTo, slug });

/**
 * Save temp candles
 *
 * @param {Object[]} candles
 */
const saveCandlesArrayToTemp = candles =>
  client.insertOrMergeArray(TABLES.STORAGE_CANDLESTEMP_TABLE, candles);

/**
 * Delete temp candles
 *
 * @param {Object[]} candles
 */
const deleteTempCandlesArray = candles =>
  client.deleteArray(TABLES.STORAGE_CANDLESTEMP_TABLE, candles);

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
    const candles = await client.queryEntities(
      TABLES.STORAGE_CANDLESTEMP_TABLE,
      query
    );
    await deleteTempCandlesArray(candles);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      'Failed to clear candles from "%s"',
      TABLES.STORAGE_CANDLESTEMP_TABLE
    );
  }
};

/**
 * Get current candle by slug
 *
 * @param {string} slug
 */
const getCurrentCandle = slug =>
  client.getEntityByPartitionKey(TABLES.STORAGE_CANDLESCURRENT_TABLE, slug);

/**
 * Save current candle
 *
 * @param {Object} candle
 */
const saveCurrentCandle = candle =>
  client.insertOrMergeEntity(TABLES.STORAGE_CANDLESCURRENT_TABLE, candle);

/**
 * Delete current candle
 *
 * @param {Object} candle
 */
const deleteCurrentCandle = ({ PartitionKey, RowKey, metadata }) =>
  client.deleteEntity(TABLES.STORAGE_CANDLESCURRENT_TABLE, {
    PartitionKey,
    RowKey,
    metadata
  });

export {
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
  clearTempCandles,
  getCurrentCandle,
  saveCurrentCandle,
  deleteCurrentCandle
};
export default Object.values(TABLES);
