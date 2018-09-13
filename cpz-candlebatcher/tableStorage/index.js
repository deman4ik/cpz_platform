const azure = require("azure-storage");
const {
  createTableIfNotExists,
  insertOrReplaceEntity,
  queryEntities
} = require("./storage");
const { objectToEntity, entityToObject, createSlug } = require("./utils");
const {
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_IMPORTERS_TABLE
} = require("../config");

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

async function saveCandlebatcherState(context, state) {
  try {
    const tableCreated = await createTableIfNotExists(
      STORAGE_CANDLEBATCHERS_TABLE
    );

    if (!tableCreated.isSuccessful)
      return { isSuccess: false, error: tableCreated };
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrReplaceEntity(
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
    const tableCreated = await createTableIfNotExists(STORAGE_IMPORTERS_TABLE);

    if (!tableCreated.isSuccessful)
      return { isSuccess: false, error: tableCreated };
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrReplaceEntity(
      STORAGE_IMPORTERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccess: false, state, error };
  }
}

async function getAllCandlebatchers(context) {
  try {
    const result = await queryEntities(STORAGE_CANDLEBATCHERS_TABLE);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return entities;
  } catch (error) {
    context.log(error);
    return null;
  }
}

async function getImporterById(context, id) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "rowKey",
        TableUtilities.QueryComparisons.EQUAL,
        id
      )
    );
    const result = await queryEntities(STORAGE_IMPORTERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return entities;
  } catch (error) {
    context.log(error);
    return null;
  }
}
module.exports = {
  saveCandlebatcherState,
  saveImporterState,
  getAllCandlebatchers,
  getImporterById
};
