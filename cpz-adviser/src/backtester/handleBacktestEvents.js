import VError from "verror";
import {
  TASKS_ADVISER_STARTBACKTEST_EVENT,
  TASKS_ADVISER_BACKTESTSTARTED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED } from "cpzState";
import { createAdviserSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { ADVISER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import execute from "./execute";

const validateStart = createValidator(
  TASKS_ADVISER_STARTBACKTEST_EVENT.dataSchema
);

/**
 * Запуск нового советника в режиме бэктеста
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleBacktest(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Запускаем бэктест
    execute(context, eventData);
    // Публикуем событие - успех
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_BACKTESTSTARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        rowKey: eventData.taskId,
        partitionKey: createAdviserSlug(
          eventData.exchange,
          eventData.asset,
          eventData.currency,
          eventData.timeframe,
          "B"
        )
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start adviser in backtest mode"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_BACKTESTSTARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export default handleBacktest;
