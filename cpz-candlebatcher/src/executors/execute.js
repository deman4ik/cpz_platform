import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import Candlebatcher from "../state/candlebatcher";
import { STOP, UPDATE, RUN } from "../config";
import loadCandle from "./loadCandle";
import createCandle from "./createCandle";
import createTimeframeCandles from "./createTimeframeCandles";
import publishEvent from "./publishEvent";
import saveState from "./saveState";
import saveCandlesToCache from "./saveCandles";
import cleanCachedCandles from "./cleanCachedCandles";
import clearTicks from "./clearTicks";

async function execute(candlebatcherState, nextAction) {
  const invocationId = uuid();
  const candlebatcher = new Candlebatcher(candlebatcherState);
  try {
    const { type, data } = nextAction;
    if (type === RUN) {
      let candle = await loadCandle(candlebatcher.state);
      if (!candle) candle = await createCandle(candlebatcher.state);
      if (!candle) candle = candlebatcher.createPrevCandle();

      if (!candle) {
        throw Error("Failed to load or create candle");
      }
      candlebatcher.handleCandle(candle);
      const candlesObject = await createTimeframeCandles(
        candlebatcher.state,
        candle
      );
      await saveCandlesToCache(Object.values(candlesObject));
      await clearTicks(candlebatcher.state);
      await cleanCachedCandles(candlebatcher.state);
      candlebatcher.createCandleEvents(candlesObject);
    } else if (type === UPDATE) {
      candlebatcher.update(data);
    } else if (type === STOP) {
      candlebatcher.stop();
    } else {
      Log.error("Unknown candlebatcher action '%s'", type);
      return candlebatcher.state;
    }

    // Если есть события для отправки
    if (candlebatcher.events.length > 0) {
      await Promise.all(
        candlebatcher.events.map(async event => {
          try {
            await publishEvent(candlebatcher.props, event);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CANDLEBATCHER_EVENTS_PUBLISH_ERROR,
                info: {
                  error: e
                }
              },
              "Failed to publish events after retries."
            );
            Log.exception(error);
            throw error;
          }
        })
      );
    }

    await saveState(candlebatcher.state);
  } catch (e) {
    let error;
    let critical;
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      ({ critical } = e.info);
      // Генерируем ошибку оркестрации
      const errorName = critical
        ? ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION
        : ServiceError.types.CANDLEBATCHER_EXECUTE_ERROR;

      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: { ...candlebatcher.props, invocationId }
        },
        "Failed to execute Candlebatcher '$s'",
        candlebatcher.taskId
      );
    } else {
      // Если ошибка сгенерирована рантаймом
      error = new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION,
          cause: e,
          info: { ...candlebatcher.props, invocationId }
        },
        "Failed to execute Candlebatcher '$s'",
        candlebatcher.taskId
      );
    }
    candlebatcher.setError(error);
    try {
      await saveState(candlebatcher.state);
    } catch (saveStateError) {
      error = new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION,
          cause: error,
          info: {
            ...candlebatcher.props,
            error: saveStateError
          }
        },
        "Failed to save state while handling execution error."
      );
    }

    if (candlebatcher.events.length > 0) {
      try {
        await Promise.all(
          candlebatcher.events.map(async event => {
            await publishEvent(candlebatcher.props, event);
          })
        );
      } catch (eventPublishError) {
        error = new ServiceError(
          {
            name: ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION,
            cause: error,
            info: {
              error: eventPublishError
            }
          },
          "Failed to publish while handling execution error."
        );
        Log.exception(error);
      }
    }
    if (critical) {
      Log.exception(error);
    } else {
      Log.error(error);
    }
  }
  return candlebatcher.state;
}

export default execute;
