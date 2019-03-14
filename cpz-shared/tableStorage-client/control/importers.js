import azure from "azure-storage";
import ServiceError from "../../error";
import dayjs from "../../utils/lib/dayjs";
import { STATUS_STARTED } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_IMPORTERS_TABLE: "Importers"
};

/**
 * Query Importer state
 *
 * @param {string} taskId - Importer task id
 * @returns {Object}
 */
const getImporterById = async taskId =>
  this.client.getEntityByRowKey(TABLES.STORAGE_IMPORTERS_TABLE, taskId);

/**
 * Find Active Importer
 *
 * @param {Object} input
 *  @property {string} input.slug - Importer slug
 *  @property {Date} input.dateFrom - import start date
 *  @property {Date} input.dateTo - import end date
 * @return {Object}
 */
const findActiveImporter = async ({ slug, dateFrom, dateTo }) => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const statusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const combinedFilter = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      statusFilter
    );
    const dateFromFilter = TableQuery.dateFilter(
      "dateFrom",
      TableUtilities.QueryComparisons.EQUAL,
      dayjs.utc(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "dateTo",
      TableUtilities.QueryComparisons.EQUAL,
      dayjs.utc(dateTo).toDate()
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedFilter,
        TableUtilities.TableOperators.AND,
        dateFilter
      )
    );
    const importers = await this.client.queryEntities(
      TABLES.STORAGE_IMPORTERS_TABLE,
      query
    );
    if (importers.length > 0) return importers[0];
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug, dateFrom, dateTo }
      },
      "Failed to read importer state"
    );
  }
};

/**
 * Save Importer state
 *
 * @param {Object} state
 */
const saveImporterState = async state =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_IMPORTERS_TABLE, state);

/**
 * Update Importer State
 *
 * @param {Object} state
 */
const updateImporterState = async state =>
  this.client.mergeEntity(TABLES.STORAGE_IMPORTERS_TABLE, state);

/**
 * Delete Importer state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteImporterState = async ({ RowKey, PartitionKey, metadata }) =>
  this.client.deleteEntity(TABLES.STORAGE_IMPORTERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getImporterById,
  findActiveImporter,
  saveImporterState,
  updateImporterState,
  deleteImporterState
};
export default Object.values(TABLES);
