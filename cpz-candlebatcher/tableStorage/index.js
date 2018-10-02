const azure = require("azure-storage");
const {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  queryEntities
} = require("./storage");
const {
  objectToEntity,
  entityToObject,
  createSlug,
  generateKey
} = require("./utils");
const {
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_IMPORTERS_TABLE,
  STORAGE_CANDLESCACHED_TABLE
} = require("../config");

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;
createTableIfNotExists(STORAGE_CANDLEBATCHERS_TABLE);
createTableIfNotExists(STORAGE_IMPORTERS_TABLE);
createTableIfNotExists(STORAGE_CANDLESCACHED_TABLE);

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
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

async function updateCandlebatcherState(context, state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    const entityUpdated = await mergeEntity(
      STORAGE_CANDLEBATCHERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
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
    return { isSuccess: false, error };
  }
}

async function updateImporterState(context, state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    const entityUpdated = await mergeEntity(STORAGE_IMPORTERS_TABLE, entity);
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, state, error };
  }
}

async function saveCandleToCache(context, candle) {
  try {
    const slug = createSlug(
      candle.exchange,
      candle.asset,
      candle.currency,
      candle.timeframe
    );
    const entity = {
      PartitionKey: entityGenerator.String(slug),
      RowKey: entityGenerator.String(generateKey()),
      ...objectToEntity(candle)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_CANDLESCACHED_TABLE,
      entity
    );

    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
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
    return { isSuccess: false, error };
  }
}

async function getImporterByKey(context, keys) {
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
    return { isSuccess: false, error };
  }
}
module.exports = {
  saveCandlebatcherState,
  updateCandlebatcherState,
  saveImporterState,
  updateImporterState,
  saveCandleToCache,
  getStartedCandlebatchers,
  getCandlebatcherByKey,
  getImporterByKey
};
