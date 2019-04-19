import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import Candlebatcher from "../state/candlebatcher";
import { STOP, UPDATE, RUN } from "../config";
import loadCandle from "./loadCandle";
import createCandle from "./createCandle";
import createTimeframeCandles from "./createTimeframeCandles";
import publishEvents from "./publishEvents";
import saveState from "./saveState";
import saveCandlesToCache from "./saveCandles";
import cleanCachedCandles from "./cleanCachedCandles";
import clearTicks from "./clearTicks";

async function execute(candlebatcherState, nextAction) {
  const invocationId = uuid();
  const candlebatcher = new Candlebatcher(candlebatcherState);
  try {
    const { type, data } = nextAction;
    Log.debug(`Executing - ${type} action`);
    if (type === RUN) {
      let candle = await loadCandle(candlebatcher.state);
      Log.debug("Loaded candle", candle);
      if (!candle) {
        candle = await createCandle(candlebatcher.state);
        Log.debug("Created candle", candle);
      }
      if (!candle) {
        candle = candlebatcher.createPrevCandle();
        Log.debug("Candle from previous", candle);
      }

      if (!candle) {
        throw Error("Failed to load or create candle");
      }
      const candleHandled = candlebatcher.handleCandle(candle);
      Log.debug("candleHandled", candleHandled);
      if (candleHandled) {
        const candlesObject = await createTimeframeCandles(
          candlebatcher.state,
          candle
        );
        Log.debug("candlesObject", candlesObject);

        await saveCandlesToCache(
          candlebatcher.state,
          Object.values(candlesObject)
        );
        await clearTicks(candlebatcher.state);
        await cleanCachedCandles(candlebatcher.state);
        candlebatcher.createCandleEvents(candlesObject);
      }
    } else if (type === UPDATE) {
      candlebatcher.update(data);
    } else if (type === STOP) {
      candlebatcher.stop();
    } else {
      Log.error("Unknown candlebatcher action '%s'", type);
      return candlebatcher.state;
    }
    Log.debug("Candlebatcher events", candlebatcher.events);
    // Отправялвем события
    await publishEvents(candlebatcher.props, candlebatcher.events);

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

    await publishEvents(candlebatcher.props, candlebatcher.events);

    if (critical) {
      Log.exception(error);
    } else {
      Log.error(error);
    }
  }
  return candlebatcher.state;
}

export default execute;
