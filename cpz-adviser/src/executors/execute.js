import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import Adviser from "../state/adviser";
import { STOP, UPDATE, CANDLE } from "../config";
import publishEvents from "./publishEvents";
import saveState from "./saveState";
import loadCandles from "./loadCandles";
import loadStrategyCode from "./loadStrategyCode";
import loadStrategyState from "./loadStrategyState";
import loadBaseIndicatorsCode from "./loadBaseIndicatorsCode";
import loadIndicatorsState from "./loadIndicatorsState";
import saveIndicatorsState from "./saveIndicatorsState";
import saveStrategyState from "./saveStrategyState";

async function execute(adviserState, nextAction) {
  const invocationId = uuid();
  const adviser = new Adviser(adviserState);
  Log.debug(`Adviser ${adviser.taskId} - execute()`);
  try {
    const { type, data } = nextAction;

    if (type === CANDLE) {
      if (data.id === adviser.lastCandle.id) {
        Log.warn(`Candle ${data.id} already processed`);
      }
      // Loading strategy
      const strategyCode = await loadStrategyCode(adviser.props);
      const strategyState = await loadStrategyState(adviser.props);
      adviser.setStrategy(strategyCode, strategyState);

      const indicatorsState = await loadIndicatorsState(adviser.props);
      adviser.indicatorsState = indicatorsState;
      // Loading indicators
      if (adviser.hasBaseIndicators) {
        const baseIndicatorsCode = await loadBaseIndicatorsCode(
          adviser.props,
          adviser.baseIndicatorsFileNames
        );
        adviser.setBaseIndicatorsCode(baseIndicatorsCode);
      }

      adviser.setIndicators();

      // Preparing candles
      if (adviser.settings.requiredHistoryCache) {
        const candles = await loadCandles(adviser.state);
        adviser.handleCachedCandles(candles);
      }
      adviser.handleCandle(data);

      // Calculation indicators
      await adviser.calcIndicators();
      // Run strategy
      adviser.runStrategy();

      adviser.finalize();

      await saveIndicatorsState(adviser.props, adviser.indicators);
      await saveStrategyState(adviser.props, adviser.strategy);
    } else if (type === UPDATE) {
      adviser.update(data);
    } else if (type === STOP) {
      adviser.stop();
    } else {
      Log.error("Unknown adviser action '%s'", type);
      return adviser.state;
    }
    await saveState(adviser.state);
    await publishEvents(adviser.props, adviser.events);
  } catch (e) {
    let error;
    let critical;
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      ({ critical = false } = e.info);
      // Генерируем ошибку оркестрации
      const errorName = critical
        ? ServiceError.types.ADVISER_EXECUTE_EXCEPTION
        : ServiceError.types.ADVISER_EXECUTE_ERROR;

      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: { ...adviser.props, invocationId }
        },
        "Failed to execute Adviser '%s'",
        adviser.taskId
      );
    } else {
      // Если ошибка сгенерирована рантаймом
      error = new ServiceError(
        {
          name: ServiceError.types.ADVISER_EXECUTE_EXCEPTION,
          cause: e,
          info: { ...adviser.props, invocationId }
        },
        "Failed to execute Adviser '%s'",
        adviser.taskId
      );
      critical = true;
    }
    adviser.setError(error);
    try {
      await saveState(adviser.state);
    } catch (saveStateError) {
      error = new ServiceError(
        {
          name: ServiceError.types.ADVISER_EXECUTE_EXCEPTION,
          cause: error,
          info: {
            ...adviser.props,
            error: saveStateError
          }
        },
        "Failed to save state while handling execution error."
      );
    }

    await publishEvents(adviser.props, adviser.events);

    if (critical) {
      Log.exception(error);
    } else {
      Log.error(error);
    }
  }
  return adviser.state;
}

export default execute;