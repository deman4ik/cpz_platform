import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_PAUSED
} from "cpz/config/state";
import { saveCandlebatcherAction } from "cpz/tableStorage-client/control/candlebatcherActions";
import { getCandlebatcherById } from "cpz/tableStorage-client/control/candlebatchers";
import { STOP, UPDATE, TASK, PAUSE, RESUME } from "../config";
import Candlebatcher from "../state/candlebatcher";
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
    // Загружаем текущий стейт
    let state = await getCandlebatcherById(taskId);
    // Если трейдер статус  занят/остановлен/ошибка
    if ([STATUS_STOPPED, STATUS_ERROR, STATUS_PAUSED].includes(state.status)) {
      Log.warn(
        `Got Candlebatcher.Run event but Candlebatcher ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }
    // Блокируем
    const leaseId = await lock(taskId);
    if (!leaseId) {
      Log.warn(
        `Got Candlebatcher.Run event but Candlebatcher ${taskId} is busy =(`
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
      // Пока есть действия
      /* eslint-disable no-await-in-loop */
      while (nextAction) {
        Log.debug(
          `Candlebatcher ${taskId} - processing ${nextAction.type} action.`
        );
        // Исполняем  - получаем обновленный стейт
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
        `Candlebatcher ${taskId} - ${
          state.status
        } - finished processing actions.`
      );
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
      if (state.status === STATUS_STARTED) {
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

    // Создаем файл блокировки
    await createLockBlob(taskId);
    // Сохраняем стейт
    await saveState(candlebatcher.state);

    // Отправляем событие Started
    await publishEvents(candlebatcher.props, candlebatcher.events);
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
    if (state.status === STATUS_STOPPED) {
      Log.warn(
        `Got Candlebatcherder.Stop event but Candlebatcher ${taskId} is ${
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

/**
 * Pause Candlebatcher Orchestrator
 *
 * @param {object} eventData
 */
async function handlePause(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getCandlebatcherById(taskId);

    if (!state) {
      Log.warn(
        `Got Candlebatcher.Pause event but Candlebatcher state not found =(`
      );
      return;
    }
    if ([STATUS_STOPPED, STATUS_PAUSED].includes(state.status)) {
      Log.warn(
        `Got Candlebatcherder.Pause event but Candlebatcher ${taskId} is ${
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
      type: PAUSE,
      actionTime: dayjs.utc().valueOf(),
      data: eventData
    });
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_PAUSE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Pause Candlebatcher '%s'",
      taskId
    );
  }
}

/**
 * Resume Candlebatcher Orchestrator
 *
 * @param {object} eventData
 */
async function handleResume(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getCandlebatcherById(taskId);

    if (!state) {
      Log.warn(
        `Got Candlebatcher.Resume event but Candlebatcher state not found =(`
      );
      return;
    }
    // Если трейдер статус - остановлен/останавливается
    if ([STATUS_STOPPED, STATUS_STARTED].includes(state.status)) {
      Log.warn(
        `Got Candlebatcherder.Resume event but Candlebatcher ${taskId} is ${
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
      type: RESUME,
      actionTime: dayjs.utc().valueOf(),
      data: eventData
    });
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_RESUME_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Resume Candlebatcher '%s'",
      taskId
    );
  }
}

export {
  handleRun,
  handleStart,
  handleStop,
  handleUpdate,
  handlePause,
  handleResume
};
