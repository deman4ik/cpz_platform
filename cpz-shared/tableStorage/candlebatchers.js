import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED } from "../config/state";
import { STORAGE_CANDLEBATCHERS_TABLE } from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_MARKET_CS);

tableStorage.createTableIfNotExists(STORAGE_CANDLEBATCHERS_TABLE);

/**
 * Query Candlebatcher State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {CandlebatcherState}
 */
const getCandlebatcherById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_CANDLEBATCHERS_TABLE, taskId);

/**
 * Query Started Candlebatchers
 *
 * @returns {CandlebatcherState[]}
 */
const getStartedCandlebatchers = async () => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "status",
        TableUtilities.QueryComparisons.EQUAL,
        STATUS_STARTED
      )
    );
    return await tableStorage.queryEntities(
      STORAGE_CANDLEBATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error
      },
      "Failed to load started candlebatchers"
    );
  }
};

/**
 * Find Candlebatcher by slug
 *
 * @param {Object} input
 * @param {string} input.slug - Candlebatcher Slug
 * @returns {CandlebatcherState}
 */
const findCandlebatcher = async ({ slug }) =>
  tableStorage.getEntityByPartitionKey(STORAGE_CANDLEBATCHERS_TABLE, slug);

/**
 * Creates new or update current Candlebatcher State
 *
 * @param {CandlebatcherState} state
 */
const saveCandlebatcherState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_CANDLEBATCHERS_TABLE, state);

/**
 * Updates current Candlebatcher State
 *
 * @param {CandlebatcherState} state
 */
const updateCandlebatcherState = async state =>
  tableStorage.mergeEntity(STORAGE_CANDLEBATCHERS_TABLE, state);

/**
 * Delete Candlebatcher state
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteCandlebatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_CANDLEBATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getCandlebatcherById,
  getStartedCandlebatchers,
  findCandlebatcher,
  saveCandlebatcherState,
  updateCandlebatcherState,
  deleteCandlebatcherState
};
