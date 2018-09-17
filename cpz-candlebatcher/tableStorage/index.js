const azure = require("azure-storage");
const {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  queryEntities
} = require("./storage");
const { objectToEntity, entityToObject, createSlug } = require("./utils");
const {
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_IMPORTERS_TABLE
} = require("../config");

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;
createTableIfNotExists(STORAGE_CANDLEBATCHERS_TABLE);
createTableIfNotExists(STORAGE_IMPORTERS_TABLE);
async function saveCandlebatcherState(context, state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_CANDLEBATCHERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccess: false, state, error };
  }
}

async function updateCandlebatcherState(context, state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await mergeEntity(
      STORAGE_CANDLEBATCHERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccess: false, state, error };
  }
}

async function saveImporterState(context, state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_IMPORTERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, state, error };
  }
}

async function getStartedCandlebatchers(context) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "status",
        TableUtilities.QueryComparisons.EQUAL,
        "started"
      )
    );
    const result = await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

async function getCandlebatcherByKey(context, keys) {
  try {
    const rowKeyFilter = new TableQuery().where(
      TableQuery.stringFilter(
        "rowKey",
        TableUtilities.QueryComparisons.EQUAL,
        keys.rowKey
      )
    );
    const partitionKeyFilter = new TableQuery().where(
      TableQuery.stringFilter(
        "rowKey",
        TableUtilities.QueryComparisons.EQUAL,
        keys.PartitionKey
      )
    );
    const query = TableQuery.combineFilters(
      rowKeyFilter,
      TableUtilities.TableOperators.AND,
      partitionKeyFilter
    );
    const result = await queryEntities(STORAGE_CANDLEBATCHERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities[0] };
  } catch (error) {
    context.log.error(error, keys);
    return { isSuccess: false, error, input: keys };
  }
}

async function getImporterByKey(context, keys) {
  try {
    const rowKeyFilter = new TableQuery().where(
      TableQuery.stringFilter(
        "rowKey",
        TableUtilities.QueryComparisons.EQUAL,
        keys.rowKey
      )
    );
    const partitionKeyFilter = new TableQuery().where(
      TableQuery.stringFilter(
        "rowKey",
        TableUtilities.QueryComparisons.EQUAL,
        keys.PartitionKey
      )
    );
    const query = TableQuery.combineFilters(
      rowKeyFilter,
      TableUtilities.TableOperators.AND,
      partitionKeyFilter
    );
    const result = await queryEntities(STORAGE_IMPORTERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities[0] };
  } catch (error) {
    context.log.error(error, keys);
    return { isSuccess: false, error, input: keys };
  }
}
module.exports = {
  saveCandlebatcherState,
  updateCandlebatcherState,
  saveImporterState,
  getStartedCandlebatchers,
  getCandlebatcherByKey,
  getImporterByKey
};
