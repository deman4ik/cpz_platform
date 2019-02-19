import azure from "azure-storage";
import VError from "verror";
import dayjs from "../utils/lib/dayjs";
import { STORAGE_TICKSCACHED_TABLE } from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_MARKET_CS);

tableStorage.createTableIfNotExists(STORAGE_TICKSCACHED_TABLE);

/**
 * Delete ticks
 *
 * @param {Ticks} ticks
 */
const deletePrevCachedTicksArray = ticks =>
  tableStorage.deleteArray(STORAGE_TICKSCACHED_TABLE, ticks);

/**
 * Query cached ticks for previous minute
 *
 * @param {Object} input
 * @param {Date} input.dateFrom
 * @param {Date} input.dateTo
 * @param {string} input.slug
 * @return {Object} -
 * @example  Example of return Object
 * getPrevCachedTicks({
 *   dateFrom: ,
 *   dateTo,
 *   slug
 * })
 * // returns {
        type: “tick”,
        tickId,
        PartitionKey: “bitfinex.BTC.USD”,
        RowKey: tickId,
        exchange: “bitfinex”,
        asset: “BTC”,
        currency: “USD”,
        direction: “BUY”,
        tradeId,
        time,
        timestamp ISO string,
        volume,
        price: Number, example 1231
      }
 */
const getPrevCachedTicks = async ({ dateFrom, dateTo, slug }) => {
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
    return await tableStorage.queryEntities(STORAGE_TICKSCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { dateFrom, dateTo, slug }
      },
      "Failed to load previous ticks"
    );
  }
};

/**
 * Save cached tick
 *
 * @param {Tick} tick
 */
const saveCachedTick = async tick =>
  tableStorage.insertOrMergeEntity(STORAGE_TICKSCACHED_TABLE, tick);

export { deletePrevCachedTicksArray, getPrevCachedTicks, saveCachedTick };
