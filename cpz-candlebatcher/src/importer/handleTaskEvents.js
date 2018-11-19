import VError from "verror";
import { IMPORTER_SERVICE } from "cpzServices";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import { modeToStr } from "cpzUtils/helpers";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { createImporterSlug } from "cpzStorage/utils";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import execute from "./execute";
import { updateImporterState } from "../tableStorage";

const validateStart = createValidator(TASKS_IMPORTER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_IMPORTER_STOP_EVENT.dataSchema);
/**
 * Запуск нового импортера свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleImportStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Запуск
    await execute(context, eventData, true);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        rowKey: eventData.taskId,
        partitionKey: createImporterSlug(
          eventData.exchange,
          eventData.asset,
          eventData.currency,
          modeToStr(eventData.mode)
        )
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start importer"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}
/**
 * Остановка импорта
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleImportStop(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    const newState = {
      RowKey: eventData.rowKey,
      PartitionKey: eventData.partitionKey,
      stopRequested: true
    };
    await updateImporterState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop importer"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export { handleImportStart, handleImportStop };
