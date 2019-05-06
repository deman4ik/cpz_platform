import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/dayjs";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { getTraderById } from "cpz/tableStorage-client/control/traders";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_ERROR } from "cpz/config/state";
import { STOP, UPDATE, TASK } from "../config";
import Trader from "../state/trader";
import {
  loadAction,
  execute,
  publishEvents,
  saveState,
  createLockBlob,
  lock,
  unlock,
  renewLock
} from "../executors";

async function handleRun(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт трейдера
    let state = await getTraderById(taskId);
    if (!state) {
      Log.warn(`Got Trader.Run event but Trader state not found =(`);
      // Выходим
      return;
    }
    // Если трейдер статус трейдера занят/остановлен/ошибка
    if ([STATUS_STOPPED, STATUS_ERROR].includes(state.status)) {
      Log.warn(
        `Got Trader.Run event but Trader ${taskId} is ${state.status} =(`
      );
      // Выходим
      return;
    }
    // Блокируем
    const leaseId = await lock(taskId);
    if (!leaseId) {
      Log.warn(`Got Trader.Run event but Trader ${taskId} is busy =(`);
      // Выходим
      return;
    }
    // Следующее действие
    let nextAction = null;

    // Загружаем следующее действие из очереди
    nextAction = await loadAction(state.taskId, state.lastAction);
    // Если есть действие
    if (nextAction) {
      // Пока есть действия
      /* eslint-disable no-await-in-loop */
      while (nextAction) {
        Log.debug(`Trader ${taskId}  - processing ${nextAction.type} action.`);
        // Исполняем трейдер - получаем обновленный стейт
        state = await execute(state, nextAction);
        if (state.status === STATUS_STARTED) {
          // Загружаем следующее действие из очереди
          nextAction = await loadAction(state.taskId, state.lastAction);
          // Если есть следующее действие
          if (nextAction) {
            // Обновляем время блокировки
            await renewLock(taskId, leaseId);
          }
        } else {
          nextAction = null;
        }
      }
      /* no-await-in-loop */

      // Если действий больше нет - освобождаем
      await unlock(taskId, leaseId);

      Log.debug(
        `Trader ${taskId} - ${state.status} - finished processing actions.`
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_HANDLE_RUN_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to run Trader '%s'",
      taskId
    );
  }
}

/**
 * Starting new Trader Orchestrator
 *
 * @param {object} eventData
 */
async function handleStart(eventData) {
  const { taskId } = eventData;

  try {
    let currentState = { ...eventData };
    // Загружаем текущий стейт трейдера
    const state = await getTraderById(taskId);

    if (state) {
      // Если статус занят/запущен
      if (state.status === STATUS_STARTED || state.stopRequested) {
        Log.warn(
          `Got Trader.Start event but Trader ${taskId} is ${
            state.status
          } and stop requested is ${state.stopRequested} =(`
        );
        // Выходим
        return;
      }

      // Сливаем старый и новый стейт
      // Оставляем новые настройки
      currentState = {
        ...state,
        settings: { ...state.settings, ...currentState.settings }
      };
    }

    // Инициализируем трейдер
    const trader = new Trader(currentState);
    trader.start();

    // Создаем файл блокировки
    await createLockBlob(taskId);
    // Сохраняем стейт
    await saveState(trader.state);

    // Отправляем событие Started
    await publishEvents(trader.props, trader.events);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_START_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Start Trader '%s'",
      taskId
    );
  }
}

/**
 * Stopping Trader Orchestrator
 *
 * @param {object} eventData
 */
async function handleStop(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт трейдера
    const state = await getTraderById(taskId);

    if (!state) {
      Log.warn(`Got Trader.Stop event but Trader state not found =(`);
      return;
    }
    // Если трейдер статус трейдера остановлен/останавливается
    if (state.status === STATUS_STOPPED || state.stopRequested) {
      Log.warn(
        `Got Trader.Stop event but Trader ${taskId} is ${
          state.status
        } and stop requested is ${state.stopRequested} =(`
      );
      // Выходим
      return;
    }

    // Сохраняем новое действие для трейдера
    await saveTraderAction({
      PartitionKey: taskId,
      RowKey: TASK,
      id: uuid(),
      type: STOP,
      actionTime: dayjs.utc().valueOf(),
      data: eventData
    });
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_STOP_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Stop Trader '%s'",
      taskId
    );
  }
}

/**
 * Updating Trader Orchestrator State
 *
 * @param {object} eventData
 */
async function handleUpdate(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт трейдера
    const state = await getTraderById(taskId);

    if (!state) {
      Log.warn(`Got Trader.Update event but Trader state not found =(`);
      return;
    }
    // Если трейдер статус трейдера остановлен/останавливается
    if (state.status === STATUS_STOPPED || state.stopRequested) {
      Log.warn(
        `Got Trader.Update event but Trader ${taskId} is ${
          state.status
        } and stop requested is ${state.stopRequested} =(`
      );
      // Выходим
      return;
    }
    // Сохраняем новое действие для трейдера
    await saveTraderAction({
      PartitionKey: taskId,
      RowKey: TASK,
      id: uuid(),
      type: UPDATE,
      actionTime: dayjs.utc().valueOf(),
      data: eventData
    });
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_UPDATE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Update Traders '%s' state",
      taskId
    );
  }
}

export { handleRun, handleStart, handleStop, handleUpdate };
