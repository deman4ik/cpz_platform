const azure = require("azure-storage");
const {
  createTableIfNotExists,
  insertOrReplaceEntity,
  queryEntities
} = require("./storage");
const { objectToEntity, entityToObject } = require("./utils");
const { createRobotSlug } = require("../robots/utils");

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;
const advisersTable = "Advisers";
async function saveState(context, state) {
  try {
    const tableCreated = await createTableIfNotExists(advisersTable);

    if (!tableCreated.isSuccessful)
      return { isSuccessful: false, error: tableCreated };
    const entity = {
      PartitionKey: entityGenerator.String(
        createRobotSlug(
          state.exchange,
          state.baseq,
          state.quote,
          state.timeframe
        )
      ),
      RowKey: entityGenerator.String(state.id),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrReplaceEntity(advisersTable, entity);
    return { isSuccessful: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccessful: false, state, error };
  }
}

async function getState(context, slug) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        slug
      )
    );
    const result = await queryEntities(advisersTable, query);
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
