import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import Trader from "../state/trader";
import { STOP, UPDATE, SIGNAL, PRICE, CHECK } from "../config";
import executeOrder from "./executeOrder";
import publishEvent from "./publishEvent";
import saveState from "./saveState";

async function execute(traderState, nextAction) {
  const invocationId = uuid();
  const trader = new Trader(traderState);
  try {
    const { id, type, data } = nextAction;

    if (
      type === PRICE ||
      type === CHECK ||
      type === SIGNAL ||
      type === UPDATE
    ) {
      trader.action = { actionId: id, actionType: type, actionData: data };
      trader[type](data);
    } else if (type === STOP) {
      trader.action = { actionId: id, actionType: type, actionData: null };
      trader.requestStop();
    } else {
      Log.error("Unknown trader action '%s'", type);
      return trader.state;
    }
    // Если есть ордера для исполнения
    if (trader.orders.length > 0) {
      const executedOrders = [];
      // Исполняем ордера
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const order of trader.orders) {
        const executedOrder = await executeOrder(trader.state, order);
        executedOrders.push(executedOrder);
      }
      /*  no-restricted-syntax, no-await-in-loop */
      trader.handleOrders(executedOrders);
    }

    // Если статус остановка и нет активных позиций
    if (trader.stopRequested && !trader.hasActivePositions) {
      // Завершаем работу
      trader.stop();
    }

    // Если есть события для отправки
    if (trader.events.length > 0) {
      await Promise.all(
        trader.events.map(async event => {
          try {
            await publishEvent(trader.props, event);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_EVENTS_PUBLISH_ERROR,
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

    await saveState(trader.state);
  } catch (e) {
    let error;
    let critical;
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      ({ critical } = e.info);
      // Генерируем ошибку оркестрации
      const errorName = critical
        ? ServiceError.types.TRADER_EXECUTE_EXCEPTION
        : ServiceError.types.TRADER_EXECUTE_ERROR;

      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: { ...trader.props, invocationId }
        },
        "Failed to execute Trader '$s'",
        trader.taskId
      );
    } else {
      // Если ошибка сгенерирована рантаймом
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_EXECUTE_EXCEPTION,
          cause: e,
          info: { ...trader.props, invocationId }
        },
        "Failed to execute Trader '$s'",
        trader.taskId
      );
    }
    trader.setError(error);
    try {
      await saveState(trader.state);
    } catch (saveStateError) {
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_EXECUTE_EXCEPTION,
          cause: error,
          info: {
            ...trader.props,
            error: saveStateError
          }
        },
        "Failed to save state while handling execution error."
      );
    }

    if (trader.events.length > 0) {
      try {
        await Promise.all(
          trader.events.map(async event => {
            await publishEvent(trader.props, event);
          })
        );
      } catch (eventPublishError) {
        error = new ServiceError(
          {
            name: ServiceError.types.TRADER_EXECUTE_EXCEPTION,
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
  return trader.state;
}

export default execute;
