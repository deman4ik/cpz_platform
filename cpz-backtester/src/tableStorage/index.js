import azure from "azure-storage";
import VError from "verror";
import {
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE
} from "cpzStorageTables";
import tableStorage from "cpzStorage";
import { generateKey } from "cpzUtils/helpers";

const { TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);

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
        tableStorage.createBacktesterSlug(
          state.exchange,
          state.asset,
          state.currency,
          state.timeframe,
          state.robotId
        )
      ),
      RowKey: entityGenerator.String(state.taskId),
      ...tableStorage.objectToEntity(state)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_BACKTESTS_TABLE, entity);
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
      ...tableStorage.objectToEntity(item)
    };
    await tableStorage.insertOrMergeEntity(STORAGE_BACKTESTITEMS_TABLE, entity);
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
