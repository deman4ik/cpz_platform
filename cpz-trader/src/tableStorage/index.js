import azure from "azure-storage";
import VError from "verror";

import { STATUS_STARTED, STATUS_BUSY, POS_STATUS_ACTIVE } from "cpzState";
import {
  STORAGE_TRADERS_TABLE,
  STORAGE_SIGNALSPENDING_TABLE,
  STORAGE_POSITIONS_TABLE
} from "cpzStorageTables";
import {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  queryEntities
} from "cpzStorage/storage";
import { objectToEntity, createTraderSlug } from "cpzStorage/utils";
import { modeToStr, generateKey } from "cpzUtils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_TRADERS_TABLE);
createTableIfNotExists(STORAGE_SIGNALSPENDING_TABLE);
/**
 * Сохранение состояния проторговщика
 *
 * @param {*} state
 * @returns
 */
async function saveTraderState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createTraderSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_TRADERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save trader state"
    );
  }
}

/**
 * Сохранение позиции
 *
 * @param {*} state
 * @returns
 */
async function savePositionState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createTraderSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          modeToStr(state.mode)
        )
      ),
      RowKey: entityGenerator.String(state.positionId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_POSITIONS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save position state"
    );
  }
}
/**
 * Сохранение сигнала ожидающего обработки
 *
 * @param {*} signal
 * @returns
 */
async function savePendingSignal(signal) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(signal.taskId),
      RowKey: entityGenerator.String(signal.signalId.toString()),
      ...objectToEntity(signal)
    };
    await insertOrMergeEntity(STORAGE_SIGNALSPENDING_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          signal
        }
      },
      'Failed to save signal to "%s"',
      STORAGE_SIGNALSPENDING_TABLE
    );
  }
}

/**
 * Обновление состояния проторговщика
 *
 * @param {*} state
 * @returns
 */
async function updateTraderState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_TRADERS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update trader state"
    );
  }
}

/**
 * Обновление состояния позиции
 *
 * @param {*} state
 * @returns
 */
async function updatePositionState(state) {
  try {
    const entity = {
      ...objectToEntity(state)
    };
    await mergeEntity(STORAGE_POSITIONS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to update position state"
    );
  }
}
/**
 * Удаление сигнала ожидающей выполнения
 *
 * @param {*} signal
 * @returns
 */
async function deletePendingSignal(signal) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(signal.taskId),
      RowKey: entityGenerator.String(signal.signalId.toString()),
      ...objectToEntity(signal)
    };
    await deleteEntity(STORAGE_SIGNALSPENDING_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          signal
        }
      },
      'Failed to delete signal from "%s"',
      STORAGE_SIGNALSPENDING_TABLE
    );
  }
}

/**
 * Поиск проторговщика по уникальному ключу
 *
 * @param {object} keys
 * @returns
 */
async function getTraderByKey(keys) {
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
    return await queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read trader state "%s", "%d"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск запущенных или занятых проторговщиков по бирже+инструменту+таймфрейму
 *
 * @param {string} slug
 * @returns
 */
async function getTradersBySlug(slug) {
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
    const busyStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_BUSY
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      busyStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          slug
        }
      },
      'Failed to read traders by slug "%s"',
      slug
    );
  }
}

/**
 * Поиск позиции по уникальному ключу
 *
 * @param {object} keys
 * @returns
 */
async function getPositonByKey(keys) {
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
    return await queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read position state "%s", "%d"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск открытых позиций по бирже+инструменту+таймфрейму
 *
 * @param {string} slug
 * @returns
 */
async function getActivePositions(slug) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const openStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_ACTIVE
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        openStatusFilter
      )
    );
    return await queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          slug
        }
      },
      'Failed to read open positions by traderId "%s"',
      slug
    );
  }
}

/**
 * Поиск открытых позиций по бирже+инструменту+таймфрейму и идентификатору проторговщика
 *
 * @param {string} slug
 * @param {string} traderId
 * @returns
 */
async function getActivePositionsByTraderId(slug, traderId) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const traderFilet = TableQuery.stringFilter(
      "traderId",
      TableUtilities.QueryComparisons.EQUAL,
      traderId
    );
    const keysFilter = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      traderFilet
    );
    const openStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_ACTIVE
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        keysFilter,
        TableUtilities.TableOperators.AND,
        openStatusFilter
      )
    );
    return await queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          slug
        }
      },
      'Failed to read open positions by traderId "%s"',
      slug
    );
  }
}

/**
 * Поиск сигналов ожидающих обработки для конкретного советника
 *
 * @param {string} id
 * @returns
 */
async function getPendingSignalsBySlugAndTraderId(id) {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        id
      )
    );
    return await queryEntities(STORAGE_SIGNALSPENDING_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          id
        }
      },
      'Failed to read pending signals by trader id "%s"',
      id
    );
  }
}

export {
  saveTraderState,
  savePositionState,
  savePendingSignal,
  updateTraderState,
  updatePositionState,
  deletePendingSignal,
  getTraderByKey,
  getTradersBySlug,
  getPositonByKey,
  getActivePositions,
  getActivePositionsByTraderId,
  getPendingSignalsBySlugAndTraderId
};
