import VError from "verror";
import {
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import Log from "cpzLog";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { getTraderById, updateTraderState } from "cpzStorage/traders";
import Trader from "./trader";

/**
 * Запуск нового проторговщика
 *
 * @param {*} context
 * @param {*} event
 */
async function handleStart(context, event) {
  const {
    subject,
    data: { taskId }
  } = event;
  try {
    // Инициализируем класс проторговщика
    const trader = new Trader(context, event.data);
    // Сохраняем состояние
    await trader.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject,
      eventType: TASKS_TRADER_STARTED_EVENT,
      data: {
        taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            event
          }
        },
        "Failed to start trader"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject,
      eventType: TASKS_TRADER_STARTED_EVENT,
      data: {
        taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

/**
 * Остановка проторговщика
 *
 * @param {*} context
 * @param {*} event
 */
async function handleStop(context, event) {
  const {
    subject,
    data: { taskId }
  } = event;
  try {
    const traderState = await getTraderById(taskId);

    // Генерируем новое состояние
    const newState = {
      RowKey: traderState.RowKey,
      PartitionKey: traderState.PartitionKey
    };
    // Если занят
    if (traderState.status === STATUS_BUSY) {
      // Создаем запрос на завершение при следующей итерации
      newState.stopRequested = true;
      await updateTraderState(newState);
    } else {
      const trader = new Trader(context, traderState);
      // Помечаем как остановленный
      trader.status = STATUS_STOPPED;
      await trader.save();
      await trader.closeActivePositions();

      // Публикуем событие - успех
      await publishEvents(TASKS_TOPIC, {
        service: TRADER_SERVICE,
        subject,
        eventType: TASKS_TRADER_STOPPED_EVENT,
        data: {
          taskId
        }
      });
    }
    // Обновляем состояние проторговщика
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            event
          }
        },
        "Failed to stop trader"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject,
      eventType: TASKS_TRADER_STOPPED_EVENT,
      data: {
        taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}
/**
 * Обновление параметров проторговщика
 *
 * @param {*} context
 * @param {*} event
 */
async function handleUpdate(context, event) {
  const {
    subject,
    data: { taskId, settings }
  } = event;
  try {
    const traderState = await getTraderById(taskId);
    const newState = {
      RowKey: traderState.RowKey,
      PartitionKey: traderState.PartitionKey
    };
    // Если занят
    if (traderState.status === STATUS_BUSY) {
      newState.updateRequested = settings;
    } else {
      newState.settings = { ...traderState.settings, ...settings };
    }
    await updateTraderState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject,
      eventType: TASKS_TRADER_UPDATED_EVENT,
      data: {
        taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            event
          }
        },
        "Failed to update trader"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject,
      eventType: TASKS_TRADER_UPDATED_EVENT,
      data: {
        taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

export { handleStart, handleStop, handleUpdate };
