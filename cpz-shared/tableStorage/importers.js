import azure from "azure-storage";
import VError from "verror";
import dayjs from "../utils/lib/dayjs";
import { STATUS_STARTED } from "../config/state";
import { STORAGE_IMPORTERS_TABLE } from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_MARKET_CS);

tableStorage.createTableIfNotExists(STORAGE_IMPORTERS_TABLE);

/**
 * Query Importer state
 *
 * @param {string} taskId - Importer task id
 * @returns {ImporterState}
 */
const getImporterById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_IMPORTERS_TABLE, taskId);

/**
 * Find Active Importer
 *
 * @param {Object} input
 * @param {string} input.slug - Importer slug
 * @param {Date} input.dateFrom - import start date
 * @param {Date} input.dateTo - import end date
 * @return {ImporterState}
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
    const importers = await tableStorage.queryEntities(
      STORAGE_IMPORTERS_TABLE,
      query
    );
    if (importers.length > 0) return importers[0];
    return null;
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
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
 * @param {ImporterState} state
 */
const saveImporterState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_IMPORTERS_TABLE, state);

/**
 * Update Importer State
 *
 * @param {ImporterState} state
 */
const updateImporterState = async state =>
  tableStorage.mergeEntity(STORAGE_IMPORTERS_TABLE, state);

/**
 * Delete Importer state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteImporterState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_IMPORTERS_TABLE, {
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
