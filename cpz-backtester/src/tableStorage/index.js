import azure from "azure-storage";
import VError from "verror";
import {
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE
} from "cpzStorageTables";
import {
  createTableIfNotExists,
  insertOrMergeEntity
} from "cpzStorage/storage";
import { objectToEntity, createBacktesterSlug } from "cpzStorage/utils";
import { generateKey } from "cpzUtils/helpers";

const { TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);

/**
 * Сохранение состояния бэктеста
 *
 * @param {*} state
 * @returns
 */
async function saveBacktesterState(state) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(
        createBacktesterSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          state.robotId
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...objectToEntity(state)
    };
    await insertOrMergeEntity(STORAGE_BACKTESTS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "BacktesterStorageError",
        cause: error,
        info: {
          state
        }
      },
      "Failed to save backtester state"
    );
  }
}

/**
 * Сохранение свечей в кэш
 * @param {*} candle
 */
async function saveBacktesterItem(item) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(`${item.taskId}`),
      RowKey: entityGenerator.String(generateKey()),
      ...objectToEntity(item)
    };
    await insertOrMergeEntity(STORAGE_BACKTESTITEMS_TABLE, entity);
  } catch (error) {
    throw new VError(
      {
        name: "AdviserStorageError",
        cause: error,
        info: {
          item
        }
      },
      'Failed to save candle to "%s"',
      STORAGE_BACKTESTITEMS_TABLE
    );
  }
}

export { saveBacktesterState, saveBacktesterItem };
