import VError from "verror";
import { createErrorOutput } from "cpz/utils/error";
import Log from "cpz/log";
import publishEvents from "cpz/eventgrid";
import { getStartedCandlebatchers } from "cpz/tableStorage/candlebatchers";
import executeCandlebatcher from "./execute";
import config from "../config";

const {
  serviceName,
  events: {
    topics: { ERROR_TOPIC },
    types: { ERROR_CANDLEBATCHER_EVENT }
  }
} = config;

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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: serviceName,
      subject: "CandlebatcherTimerError",
      eventType: ERROR_CANDLEBATCHER_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

export default handleTimer;
