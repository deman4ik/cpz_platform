import azure from "azure-storage";
import VError from "verror";

import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import {
  STORAGE_TRADERS_TABLE,
  STORAGE_SIGNALSPENDING_TABLE
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
 * Поиск сигналов ожидающих обработки для конкретного советника
 *
 * @param {string} id
 * @returns
 */
async function getPendingSignalsByTraderId(id) {
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
  savePendingSignal,
  updateTraderState,
  deletePendingSignal,
  getTraderByKey,
  getTradersBySlug,
  getPendingSignalsByTraderId
};
