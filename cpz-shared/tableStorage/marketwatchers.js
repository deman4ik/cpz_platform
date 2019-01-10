import azure from "azure-storage";
import VError from "verror";
import { STORAGE_MARKETWATCHERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_MARKETWATCHERS_TABLE);

/**
 * Query Marketwatcher state by uniq id
 *
 * @param {Object} input
 * @param {string} input.taskId - Marketwatcher task id
 */
const getMarketwatcherById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_MARKETWATCHERS_TABLE, taskId);

/**
 * Find Marketwatcher
 *
 * @param {Object} input
 * @param {string} input.exchange - Marketwatcher exchange
 * @returns {MarketwatcherState}
 */
const findMarketwatcher = async exchange =>
  tableStorage.getEntityByPartitionKey(STORAGE_MARKETWATCHERS_TABLE, exchange);

/**
 * Save Marketwatcher state
 *
 * @param {MarketwatcherState} state
 */
const saveMarketwatcherState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_MARKETWATCHERS_TABLE, state);

/**
 * Delete Marketwatcher state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteMarketwatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_MARKETWATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getMarketwatcherById,
  findMarketwatcher,
  saveMarketwatcherState,
  deleteMarketwatcherState
};
