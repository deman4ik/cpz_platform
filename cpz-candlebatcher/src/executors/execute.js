import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/dayjs";
import { createMinutesList } from "cpz/utils/candlesUtils";
import { durationMinutes } from "cpz/utils/helpers";
import Candlebatcher from "../state/candlebatcher";
import { STOP, UPDATE, RUN, PAUSE } from "../config";
import loadCandles from "./loadCandles";
import createCandle from "./createCandle";
import createTimeframeCandles from "./createTimeframeCandles";
import publishEvents from "./publishEvents";
import saveState from "./saveState";
import saveCandlesToCache from "./saveCandlesToStorage";
import saveCandleToDb from "./saveCandleToDb";
import cleanCachedCandles from "./cleanCachedCandles";
import clearTicks from "./clearTicks";

async function execute(candlebatcherState, nextAction) {
  const candlebatcher = new Candlebatcher(candlebatcherState);
  try {
    const { type, data } = nextAction;
    if (type === RUN) {
      const currentCandleTime = dayjs
        .utc()
        .startOf("minute")
        .add(-1, "minute")
        .toISOString();
      let loadFrom;
      const { lastCandle } = candlebatcher;
      if (lastCandle && lastCandle.time) {
        loadFrom = dayjs
          .utc(lastCandle.time)
          .add(1, "minute")
          .toISOString();
      } else {
        loadFrom = dayjs
          .utc()
          .startOf("minute")
          .add(-2, "minute")
          .toISOString();
      }
      const candles = await loadCandles(candlebatcher.state, loadFrom);
      if (candles && Array.isArray(candles) && candles.length > 0) {
        const duration = durationMinutes(loadFrom, currentCandleTime) + 1;
        const minutes = createMinutesList(
          loadFrom,
          currentCandleTime,
          duration
        );

        /* eslint-disable no-restricted-syntax, no-await-in-loop */
        for (const minute of minutes) {
          let candle = candles.find(
            c => c.time === dayjs.utc(minute).valueOf()
          );
          if (!candle) {
            candle = await createCandle(candlebatcher.state, minute);
          }
          if (!candle) {
            candle = candlebatcher.createPrevCandle(minute);
          }

          if (candle) {
            const candleHandled = candlebatcher.handleCandle(candle);
            if (candleHandled) {
              const candlesObject = await createTimeframeCandles(
                candlebatcher.state,
                candle
              );
              await saveCandleToDb(candlebatcher.props, candlesObject);
              await saveCandlesToCache(
                candlebatcher.props,
                Object.values(candlesObject)
              );
              const clearTasks = [
                clearTicks(candlebatcher.state, minute),
                cleanCachedCandles(candlebatcher.state, minute)
              ];
              try {
                await Promise.all(clearTasks);
              } catch (e) {
                Log.error(e);
              }
              candlebatcher.createCandleEvents(candlesObject);
            }
          } else {
            const error = new ServiceError(
              {
                name: ServiceError.types.CANDLEBATCHER_EXECUTE_ERROR,
                info: { ...candlebatcher.props }
              },
              "Failed to load or create candle Candlebatcher '%s'",
              candlebatcher.taskId
            );

            candlebatcher.setError(error);
          }
        }
        /*  no-restricted-syntax, no-await-in-loop */
      }
    } else if (type === UPDATE) {
      candlebatcher.update(data);
    } else if (type === STOP) {
      candlebatcher.stop();
    } else if (type === PAUSE) {
      candlebatcher.pause();
    } else {
      Log.error("Unknown candlebatcher action '%s'", type);
      return candlebatcher.state;
    }

    // Отправялвем события
    await publishEvents(candlebatcher.props, candlebatcher.events);

    await saveState(candlebatcher.state);
  } catch (e) {
    let error;
    let critical;
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      ({ critical = false } = e.info);
      // Генерируем ошибку оркестрации
      const errorName = critical
        ? ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION
        : ServiceError.types.CANDLEBATCHER_EXECUTE_ERROR;

      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: { ...candlebatcher.props }
        },
        "Failed to execute Candlebatcher '%s'",
        candlebatcher.taskId
      );
    } else {
      // Если ошибка сгенерирована рантаймом
      error = new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_EXECUTE_EXCEPTION,
          cause: e,
          info: { ...candlebatcher.props }
        },
        "Failed to execute Candlebatcher '%s'",
        candlebatcher.taskId
      );
      critical = true;
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
