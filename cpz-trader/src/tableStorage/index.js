import azure from "azure-storage";
import VError from "verror";

import {
  STATUS_STARTED,
  STATUS_BUSY,
  POS_STATUS_OPENED,
  createTraderSlug
} from "cpzState";
import {
  STORAGE_TRADERS_TABLE,
  STORAGE_SIGNALSPENDING_TABLE,
  STORAGE_POSITIONS_TABLE
} from "cpzStorageTables";
import tableStorage from "cpzStorage";
import { modeToStr } from "cpzUtils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_TRADERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_SIGNALSPENDING_TABLE);
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
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_TRADERS_TABLE, entity);
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
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_POSITIONS_TABLE, entity);
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
      ...tableStorage.objectToEntity(signal)
    };
    await tableStorage.insertOrMergeEntity(
      STORAGE_SIGNALSPENDING_TABLE,
      entity
    );
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
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.mergeEntity(STORAGE_TRADERS_TABLE, entity);
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
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.mergeEntity(STORAGE_POSITIONS_TABLE, entity);
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
      ...tableStorage.objectToEntity(signal)
    };
    await tableStorage.deleteEntity(STORAGE_SIGNALSPENDING_TABLE, entity);
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
    return await tableStorage.queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read trader state "%s", "%s"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск запущенных или занятых проторговщиков по бирже+инструменту+таймфрейму
 *
 * @param {object} input
 * @returns
 */
async function getTradersBySlug(input) {
  try {
    const { exchange, asset, currency, timeframe, mode, modeStr } = input;
    const slug = createTraderSlug(
      exchange,
      asset,
      currency,
      timeframe,
      modeStr || modeToStr(mode)
    );
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
    return await tableStorage.queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: input
      },
      "Failed to read traders by slug"
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
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query)[0];
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: {
          keys
        }
      },
      'Failed to read position state "%s", "%s"',
      keys.partitionKey,
      keys.rowKey
    );
  }
}

/**
 * Поиск открытых позиций по бирже+инструменту+таймфрейму
 *
 * @param {object} input
 * @returns
 */
async function getActivePositions(input) {
  try {
    const { exchange, asset, currency, timeframe, mode, modeStr } = input;
    const slug = createTraderSlug(
      exchange,
      asset,
      currency,
      timeframe,
      modeStr || modeToStr(mode)
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const openStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_OPENED
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        openStatusFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: input
      },
      "Failed to read open positions"
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
      POS_STATUS_OPENED
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        keysFilter,
        TableUtilities.TableOperators.AND,
        openStatusFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query);
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
    return await tableStorage.queryEntities(
      STORAGE_SIGNALSPENDING_TABLE,
      query
    );
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
