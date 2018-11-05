import VError from "verror";
import { ERROR_CANDLEBATCHER_EVENT, ERROR_TOPIC } from "cpzEventTypes";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import publishEvents from "cpzEvents";
import executeCandlebatcher from "./execute";
import { getStartedCandlebatchers } from "../tableStorage";

async function handleTimer(context) {
  try {
    // Считываем все запущенные candlebatcherы
    const candlebatchers = await getStartedCandlebatchers();
    // Параллельно выполняем все задачи
    await Promise.all(
      candlebatchers.map(async state => {
        await executeCandlebatcher(context, state);
      })
    );
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "CandlebatcherError",
          cause: error
        },
        "Failed to stop candlebatcher"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: "CandlebatcherTimerError",
      eventType: ERROR_CANDLEBATCHER_EVENT,
      data: {
        error: errorOutput
      }
    });
  }
}

export default handleTimer;
