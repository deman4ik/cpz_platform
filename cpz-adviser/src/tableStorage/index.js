import azure from "azure-storage";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import {
  STORAGE_ADVISERS_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_CANDLESCACHED_TABLE
} from "cpzStorageTables";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  queryEntities
} from "./storage";
import { objectToEntity, entityToObject, createSlug } from "./utils";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_ADVISERS_TABLE);
createTableIfNotExists(STORAGE_CANDLESPENDING_TABLE);

/**
 * Сохранение состояния советника
 *
 * @param {*} context
 * @param {*} state
 * @returns
 */
async function saveAdviserState(context, state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createSlug(state.exchange, state.asset, state.currency, state.timeframe)
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_ADVISERS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

/**
 * Сохранение свечей ожидающих обработки
 *
 * @param {*} context
 * @param {*} candle
 * @returns
 */
async function savePendingCandles(context, candle) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(candle.taskId),
      RowKey: entityGenerator.String(candle.id.toString()),
      ...objectToEntity(candle)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_CANDLESPENDING_TABLE,
      entity
    );
    return { isSuccess: entityUpdated, taskId: candle.taskId };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

/**
 * Обновление состояния советника
 *
 * @param {*} context
 * @param {*} state
 * @returns
 */
async function updateAdviserState(context, state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    const entityUpdated = await mergeEntity(STORAGE_ADVISERS_TABLE, entity);
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

/**
 * Удаление свечи ожидающей выполнения
 *
 * @param {*} context
 * @param {*} candle
 * @returns
 */
async function deletePendingCandles(context, candle) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(candle.taskId),
      RowKey: entityGenerator.String(candle.id.toString()),
      ...objectToEntity(candle)
    };
    const entityDeleted = await deleteEntity(
      STORAGE_CANDLESPENDING_TABLE,
      entity
    );
    return { isSuccess: entityDeleted };
  } catch (error) {
    context.log.error(error);
    return { isSuccess: false, error };
  }
}

/**
 * Поиск советника по уникальному ключу
 *
 * @param {*} context
 * @param {object} keys
 * @returns
 */
async function getAdviserByKey(context, keys) {
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
    const result = await queryEntities(STORAGE_ADVISERS_TABLE, query);
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

/**
 * Поиск запущенных или занятых советников по бирже+инструменту+таймфрейму
 *
 * @param {*} context
 * @param {string} slug
 * @returns
 */
async function getAdvisersBySlug(context, slug) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const budyStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_BUSY
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      budyStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    const result = await queryEntities(STORAGE_ADVISERS_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities };
  } catch (error) {
    context.log.error(error, slug);
    return { isSuccess: false, error };
  }
}

/**
 * Отбор закешированныз свечей по ключу
 *
 * @param {*} context
 * @param {string} key
 * @returns
 */
async function getCachedCandlesByKey(context, key, limit) {
  try {
    const query = new TableQuery()
      .where(
        TableQuery.stringFilter(
          "PartitionKey",
          TableUtilities.QueryComparisons.EQUAL,
          key
        )
      )
      .top(limit);
    const result = await queryEntities(STORAGE_CANDLESCACHED_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities };
  } catch (error) {
    context.log.error(error, key);
    return { isSuccess: false, error };
  }
}

/**
 * Поиск свечей ожидающих обработки для конкретного советника
 *
 * @param {*} context
 * @param {string} id
 * @returns
 */
async function getPendingCandlesByAdviserId(context, id) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        id
      )
    );
    const result = await queryEntities(STORAGE_CANDLESPENDING_TABLE, query);
    const entities = [];
    if (result) {
      result.entries.forEach(element => {
        entities.push(entityToObject(element));
      });
    }
    return { isSuccess: true, data: entities };
  } catch (error) {
    context.log.error(error, id);
    return { isSuccess: false, error };
  }
}
export {
  saveAdviserState,
  savePendingCandles,
  updateAdviserState,
  deletePendingCandles,
  getAdviserByKey,
  getAdvisersBySlug,
  getCachedCandlesByKey,
  getPendingCandlesByAdviserId
};
