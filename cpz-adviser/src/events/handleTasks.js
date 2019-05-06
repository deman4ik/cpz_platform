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
import { saveAdviserAction } from "cpz/tableStorage-client/control/adviserActions";
import { getAdviserById } from "cpz/tableStorage-client/control/advisers";
import { STOP, UPDATE, TASK, PAUSE, RESUME } from "../config";
import Adviser from "../state/adviser";
import {
  loadAction,
  loadStrategyCode,
  loadBaseIndicatorsCode,
  execute,
  publishEvents,
  saveState,
  saveStrategyState,
  saveIndicatorsState,
  createLockBlob,
  lock,
  unlock,
  renewLock
} from "../executors";

async function handleRun(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    let state = await getAdviserById(taskId);
    // Если трейдер статус  занят/остановлен/ошибка
    if ([STATUS_STOPPED, STATUS_ERROR, STATUS_PAUSED].includes(state.status)) {
      Log.warn(
        `Got Adviser.Run event but Adviser ${taskId} is ${state.status} =(`
      );
      // Выходим
      return;
    }
    // Блокируем
    const leaseId = await lock(taskId);
    if (!leaseId) {
      Log.warn(`Got Adviser.Run event but Adviser ${taskId} is busy =(`);
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
        Log.debug(`Adviser ${taskId} - processing ${nextAction.type} action.`);
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
        `Adviser ${taskId} - ${state.status} - finished processing actions.`
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.ADVISER_HANDLE_RUN_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to run Adviser '%s'",
      taskId
    );
  }
}

/**
 * Starting new Adviser Orchestrator
 *
 * @param {object} eventData
 */
async function handleStart(eventData) {
  const { taskId } = eventData;
  try {
    const currentState = { ...eventData };
    // Инициализируем новый загрузчик
    const state = getAdviserById(taskId);
    if (state) {
      // Если статус занят/запущен
      if (state.status === STATUS_STARTED) {
        Log.warn(
          `Got Adviser.Start event but Adviser ${taskId} is ${state.status} =(`
        );
        // Выходим
        return;
      }
    }

    // Инициализируем
    const adviser = new Adviser(currentState);
    const strategyCode = await loadStrategyCode(adviser.props);
    adviser.setStrategy(strategyCode);
    adviser.initStrategy();
    if (adviser.hasBaseIndicators) {
      const baseIndicatorsCode = await loadBaseIndicatorsCode(
        adviser.props,
        adviser.baseIndicatorsFileNames
      );
      adviser.setBaseIndicatorsCode(baseIndicatorsCode);
    }
    adviser.setIndicators();
    adviser.initIndicators();
    adviser.start();

    // Создаем файл блокировки
    await createLockBlob(taskId);
    // Сохраняем стейт
    await saveIndicatorsState(adviser.props, adviser.indicators);
    await saveStrategyState(adviser.props, adviser.strategy);
    await saveState(adviser.state);

    // Отправляем событие Started
    await publishEvents(adviser.props, adviser.events);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.ADVISER_START_ERROR,
        cause: e,
        info: { ...eventData, critical: true }
      },
      "Failed to Start Adviser '%s'",
      taskId
    );
  }
}
/**
 * Stopping Adviser Orchestrator
 *
 * @param {object} eventData
 */
async function handleStop(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getAdviserById(taskId);

    if (!state) {
      Log.warn(`Got Adviser.Stop event but Adviser state not found =(`);
      return;
    }
    // Если трейдер статус - остановлен/останавливается
    if (state.status === STATUS_STOPPED) {
      Log.warn(
        `Got TraAdviserder.Stop event but Adviser ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }

    // Сохраняем новое действие
    await saveAdviserAction({
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
        name: ServiceError.types.ADVISER_STOP_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Stop Adviser '%s'",
      taskId
    );
  }
}

/**
 * Updating Adviser Orchestrator State
 *
 * @param {object} eventData
 */
async function handleUpdate(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getAdviserById(taskId);

    if (!state) {
      Log.warn(`Got Adviser.Update event but Adviser state not found =(`);
      return;
    }
    // Если трейдер статус  остановлен/останавливается
    if (state.status === STATUS_STOPPED) {
      Log.warn(
        `Got Adviser.Update event but Adviser ${taskId} is ${state.status} =(`
      );
      // Выходим
      return;
    }
    // Сохраняем новое действие
    await saveAdviserAction({
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
        name: ServiceError.types.ADVISER_UPDATE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Update Adviser '%s' state",
      taskId
    );
  }
}

/**
 * Pause Adviser Orchestrator
 *
 * @param {object} eventData
 */
async function handlePause(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getAdviserById(taskId);

    if (!state) {
      Log.warn(`Got Adviser.Pause event but Adviser state not found =(`);
      return;
    }
    if ([STATUS_STOPPED, STATUS_PAUSED].includes(state.status)) {
      Log.warn(
        `Got Adviserder.Pause event but Adviser ${taskId} is ${state.status} =(`
      );
      // Выходим
      return;
    }

    // Сохраняем новое действие
    await saveAdviserAction({
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
        name: ServiceError.types.ADVISER_PAUSE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Pause Adviser '%s'",
      taskId
    );
  }
}

/**
 * Resume Adviser Orchestrator
 *
 * @param {object} eventData
 */
async function handleResume(eventData) {
  const { taskId } = eventData;
  try {
    // Загружаем текущий стейт
    const state = await getAdviserById(taskId);

    if (!state) {
      Log.warn(`Got Adviser.Resume event but Adviser state not found =(`);
      return;
    }
    // Если трейдер статус - остановлен/останавливается
    if ([STATUS_STOPPED, STATUS_STARTED].includes(state.status)) {
      Log.warn(
        `Got Adviserder.Resume event but Adviser ${taskId} is ${
          state.status
        } =(`
      );
      // Выходим
      return;
    }

    // Сохраняем новое действие
    await saveAdviserAction({
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
        name: ServiceError.types.ADVISER_RESUME_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Resume Adviser '%s'",
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
