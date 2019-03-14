import azure from "azure-storage";
import ServiceError from "../../error";
import dayjs from "../../utils/lib/dayjs";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_TICKSCACHED_TABLE: "TicksCashed"
};

/**
 * Delete ticks
 *
 * @param {Object[]} ticks
 */
const deletePrevCachedTicksArray = ticks =>
  this.client.deleteArray(TABLES.STORAGE_TICKSCACHED_TABLE, ticks);

const deletePrevCachedTicks = async ({ dateTo, slug }) => {
  try {
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs.utc(dateTo).toDate()
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        dateToFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    const ticks = await this.client.queryEntities(
      TABLES.STORAGE_TICKSCACHED_TABLE,
      query
    );
    await deletePrevCachedTicksArray(ticks);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { dateTo, slug }
      },
      "Failed to delete previous ticks"
    );
  }
};
/**
 * Query cached ticks for previous minute
 *
 * @param {Object} input
 *  @property {Date} input.dateFrom
 *  @property {Date} input.dateTo
 *  @property {string} input.slug
 * @return {Object} -
 * @example  Example of return Object
 * getPrevCachedTicks({
 *   dateFrom: ,
 *   dateTo,
 *   slug
 * })
     {
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
    return await this.client.queryEntities(
      TABLES.STORAGE_TICKSCACHED_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @param {Object} tick
 */
const saveCachedTick = async tick =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_TICKSCACHED_TABLE, tick);

export {
  deletePrevCachedTicksArray,
  deletePrevCachedTicks,
  getPrevCachedTicks,
  saveCachedTick
};
export default Object.values(TABLES);
