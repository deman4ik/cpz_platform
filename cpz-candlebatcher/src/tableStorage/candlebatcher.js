import azure from "azure-storage";
import VError from "verror";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  queryEntities
} from "cpzStorage/storage";
import { objectToEntity, createCandlebatcherSlug } from "cpzStorage/utils";
import { modeToStr } from "cpzUtils/helpers";
import { STORAGE_CANDLEBATCHERS_TABLE } from "cpzStorageTables";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_CANDLEBATCHERS_TABLE);

async function saveCandlebatcherState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createCandlebatcherSlug(
          state.exchange,
          state.asset,
          state.currency,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_CANDLEBATCHERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save candlebatcher state"
    );
  }
}

async function updateCandlebatcherState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_CANDLEBATCHERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update candlebatcher state"
    );
  }
}

async function getStartedCandlebatchers() {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "status",
        TableUtilities.QueryComparisons.EQUAL,
        "started"
      )
    );
    return await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      "Failed to load started candlebatchers"
    );
  }
}

async function getCandlebatcherByKey(keys) {
  try {
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.EQUAL,
      keys.rowKey
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      keys.partitionKey
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        rowKeyFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query)[0];
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error,
        info: {
          keys
        }
      },
      "Failed to load candlebatcher by key"
    );
  }
}

export {
  saveCandlebatcherState,
  updateCandlebatcherState,
  getStartedCandlebatchers,
  getCandlebatcherByKey
};
