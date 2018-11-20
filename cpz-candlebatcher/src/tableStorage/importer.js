import azure from "azure-storage";
import VError from "verror";
import { createImporterSlug } from "cpzState";
import tableStorage from "cpzStorage";
import { modeToStr } from "cpzUtils/helpers";
import { STORAGE_IMPORTERS_TABLE } from "cpzStorageTables";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_IMPORTERS_TABLE);

async function saveImporterState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createImporterSlug(
          state.exchange,
          state.asset,
          state.currency,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_IMPORTERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save importer state"
    );
  }
}

async function updateImporterState(state) {
  try {
    const entity = {
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.mergeEntity(STORAGE_IMPORTERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update importer state"
    );
  }
}

async function getImporterByKey(keys) {
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
    const data = await tableStorage.queryEntities(
      STORAGE_IMPORTERS_TABLE,
      query
    );
    if (!data) throw new Error("Can't load data");
    return data[0];
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: {
          keys
        }
      },
      "Failed to load importer by key"
    );
  }
}

export { saveImporterState, updateImporterState, getImporterByKey };
