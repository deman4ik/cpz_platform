import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/lib/dayjs";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR
} from "cpz/config/state";
import { saveCandlebatcherAction } from "cpz/tableStorage-client/control/candlebatcherActions";
import { getCandlebatcherById } from "cpz/tableStorage-client/control/candlebatchers";
import { STOP, UPDATE, TASK } from "../config";
import Candlebatcher from "../state/candlebatcher";
import { loadAction, execute, publishEvents, saveState } from "../executors";

async function handleRun(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    let state = await getCandlebatcherById(taskId);
    // Если трейдер статус  занят/остановлен/ошибка
    if ([STATUS_BUSY, STATUS_STOPPED, STATUS_ERROR].includes(state.status)) {
      Log.warn(
        `Got Candlebatcher.Run event but Candlebatcher ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }

    // Следующее действие
    let nextAction = null;

    // Загружаем следующее действие из очереди
    nextAction = await loadAction(state.taskId, state.lastAction);
    // Если есть действие
    if (nextAction) {
      // Меняем статус  - занят
      state.status = STATUS_BUSY;
      const lock = await saveState(state, true);

      if (lock) {
        // Пока есть действия
        /* eslint-disable no-await-in-loop */
        while (nextAction) {
          Log.debug(
            `Candlebatcher ${taskId} - ${STATUS_BUSY} - processing ${
              nextAction.type
            } action.`
          );
          // Исполняем  - получаем обновленный стейт
          state = await execute(state, nextAction);
          if (state.status === STATUS_BUSY) {
            // Загружаем следующее действие из очереди
            nextAction = await loadAction(state.taskId, state.lastAction);
          } else {
            nextAction = null;
          }
        }
        /* no-await-in-loop */

        // Если действие больше нет и статус не поменялся
        if (state.status === STATUS_BUSY) {
          // Меняем статус трейдера - запущен
          state.status = STATUS_STARTED;
          await saveState(state);
        }
        Log.debug(
          `Candlebatcher ${taskId} - ${
            state.status
          } - finished processing actions.`
        );
      } else {
        Log.warn(`Candlebatcher ${taskId} already processing...`);
      }
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_HANDLE_RUN_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to run Candlebatcher '%s'",
      taskId
    );
  }
}

/**
 * Starting new Candlebatcher Orchestrator
 *
 * @param {object} eventData
 */
async function handleStart(eventData) {
  const { taskId } = eventData;
  try {
    const currentState = { ...eventData };
    // Инициализируем новый загрузчик
    const state = getCandlebatcherById(taskId);
    if (state) {
      // Если статус занят/запущен
      if ([STATUS_BUSY, STATUS_STARTED].includes(state.status)) {
        Log.warn(
          `Got Candlebatcher.Start event but Candlebatcher ${taskId} is ${
            state.status
          } =(`
        );
        // Выходим
        return;
      }
    }

    // Инициализируем
    const candlebatcher = new Candlebatcher(currentState);
    candlebatcher.start();

    // Отправляем событие Started
    await publishEvents(candlebatcher.props, candlebatcher.events);

    // Сохраняем стейт
    await saveState(candlebatcher.state);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_START_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Start Candlebatcher '%s'",
      taskId
    );
  }
}
/**
 * Stopping Candlebatcher Orchestrator
 *
 * @param {object} eventData
 */
async function handleStop(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getCandlebatcherById(taskId);

    if (!state) {
      Log.warn(
        `Got Candlebatcher.Stop event but Candlebatcher state not found =(`
      );
      return;
    }
    // Если трейдер статус - остановлен/останавливается
    if ([STATUS_STOPPED].includes(state.status)) {
      Log.warn(
        `Got TraCandlebatcherder.Stop event but Candlebatcher ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }

    // Сохраняем новое действие
    await saveCandlebatcherAction({
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
        name: ServiceError.types.CANDLEBATCHER_STOP_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Stop Candlebatcher '%s'",
      taskId
    );
  }
}

/**
 * Updating Candlebatcher Orchestrator State
 *
 * @param {object} eventData
 */
async function handleUpdate(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getCandlebatcherById(taskId);

    if (!state) {
      Log.warn(
        `Got Candlebatcher.Update event but Candlebatcher state not found =(`
      );
      return;
    }
    // Если трейдер статус  остановлен/останавливается
    if ([STATUS_STOPPED].includes(state.status)) {
      Log.warn(
        `Got Candlebatcher.Update event but Candlebatcher ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }
    // Сохраняем новое действие
    await saveCandlebatcherAction({
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
        name: ServiceError.types.CANDLEBATCHER_UPDATE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Update Candlebatcher '%s' state",
      taskId
    );
  }
}

export { handleRun, handleStart, handleStop, handleUpdate };
