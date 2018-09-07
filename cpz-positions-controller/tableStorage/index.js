const azure = require("azure-storage");

const {
  createTableIfNotExists,
  insertOrReplaceEntity,
  queryEntities
} = require("./storage");

const { objectToEntity, entityToObject } = require("./utils");

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;
const positionsTable = "Positions";

async function saveState(context, signal) {
  try {
    const tableCreated = await createTableIfNotExists(positionsTable);

    if (!tableCreated.isSuccessful)
      return { isSuccessful: false, error: tableCreated };
    const entity = {
      PartitionKey: entityGenerator.String(
        signal
      ),
      RowKey: entityGenerator.String(signal.id),
      ...objectToEntity(signal)
    };
    const entityUpdated = await insertOrReplaceEntity(positionsTable, entity);
    return { isSuccessful: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccessful: false, state, error };
  }
}

async function getState(context, signal) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        signal
      )
    );
    const result = await queryEntities(positionsTable, query);
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

module.exports = { saveState, getState };
