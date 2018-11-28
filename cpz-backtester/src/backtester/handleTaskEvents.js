import VError from "verror";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { BACKTESTER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import Backtester from "./backtester";

const validateStart = createValidator(TASKS_BACKTESTER_START_EVENT.dataSchema);

/**
 * Запуск нового советника в режиме бэктеста
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Запускаем бэктест
    const backtester = new Backtester(context, eventData);
    await backtester.execute();
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start backtester mode"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

// TODO: Handle Stop
// may be in child process?

export default handleStart;
