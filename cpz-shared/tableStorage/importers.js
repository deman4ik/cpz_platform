import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED } from "../config/state";
import { STORAGE_IMPORTERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

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
 * Check if Importer exists
 *
 * @param {Object} input
 * @param {string} input.slug - Importer slug
 * @param {Date} input.dateFrom - import start date
 * @param {Date} input.dateTo - import end date
 * @return {boolean}
 */
const isImporterExists = async ({ slug, dateFrom, dateTo }) => {
  // TODO
};

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
  saveImporterState,
  updateImporterState,
  deleteImporterState
};
