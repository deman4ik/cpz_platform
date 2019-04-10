import * as df from "durable-functions";
import VError from "verror";
import Log from "cpz/log";
import dayjs from "cpz/utils/lib/dayjs";
import ServiceError from "cpz/error";
import { STATUS_STOPPING } from "cpz/config/state";
import {
  ERROR_TRADER_ERROR_EVENT,
  ERROR_TRADER_WARN_EVENT
} from "cpz/events/types";
import { SERVICE_NAME, FUNCTIONS, INTERNAL } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

const {
  ACTIVITY_EVENT_PUBLISH,
  ACTIVITY_EXECUTE_ORDERS,
  ACTIVITY_LOAD_ACTION,
  ACTIVITY_SAVE_STATE,
  ACTIVITY_EXECUTE_TRADER
} = FUNCTIONS;

const {
  actions: { START, UPDATE, STOP, SIGNAL, PRICE, CHECK, REQUEST_STOP, ERROR },

  status: { READY, BUSY, STOPPED },
  events: { TRADER_ACTION },
  checkActionSeconds
} = INTERNAL;

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: SERVICE_NAME
});

const orchestrator = df.orchestrator(function* trader(context) {
  // Считываем начальный стейт из параметров
  let state = context.df.getInput();
  // Добавление контекста выполнения и общих параметров трейдера в логгер
  Log.addContext(context, traderStateToCommonProps(state));
  //  Объект со списком событий для отправки
  let eventsToSend = {};
  // Объект со списком ордеров для исполнения на бирже
  let ordersToExecute = {};
  // Следующее действие
  let nextAction = null;
  // Признак остановки трейдера
  let stop = false;
  // Результат выполнения окрестратора
  let result = null;
  // Опции повторных попыток выполнения функций
  const retryOptions = new df.RetryOptions(500, 5);
  try {
    // Запрашиваем следующее действие трейдера из очереди
    nextAction = yield context.df.callActivityWithRetry(
      ACTIVITY_LOAD_ACTION,
      retryOptions,
      { state: traderStateToCommonProps(state), lastAction: state.lastAction }
    );

    // Если новых действие нет
    if (!nextAction) {
      // Устанавливаем статус - готов
      context.df.setCustomStatus(READY);
      // Log.warn(READY, "!!!!!!!!!!!!!!!!!!!!!");

      // Log.debug("Waiting for external event");
      const external = context.df.waitForExternalEvent(TRADER_ACTION);
      const timer = context.df.createTimer(
        dayjs
          .utc(context.df.currentUtcDateTime)
          .add(checkActionSeconds, "seconds")
          .toDate()
      );
      // Ждем внешних эвентов или истечения таймера
      yield context.df.Task.any([external, timer]);
      // Запрашиваем следующее действие трейдера из очереди
      nextAction = yield context.df.callActivityWithRetry(
        ACTIVITY_LOAD_ACTION,
        retryOptions,
        { state: traderStateToCommonProps(state), lastAction: state.lastAction }
      );
      // Если нового действия нет - выходим
      if (!nextAction) {
        yield context.df.continueAsNew(state);
        return state;
      }
    }

    // Если действие уже обработано - выходим
    if (state.lastAction && nextAction.id === state.lastAction.actionId) {
      //  Log.warn("Action '%s' have already been processed", nextAction.id);
      yield context.df.continueAsNew(state);
      return state;
    }

    // Если есть новое действие (или пришел внешний эвент с действием)
    // Устанавливаем стутс - занят
    context.df.setCustomStatus(BUSY);
    // Log.warn(BUSY, "!!!!!!!!!!!!!!!!!!!!!");
    // Проверяем тип действия
    const { id, type, data } = nextAction;
    if (
      type === PRICE ||
      type === CHECK ||
      type === SIGNAL ||
      type === START ||
      type === UPDATE
    ) {
      const {
        currentState,
        currentOrders,
        currentEvents
      } = yield context.df.callActivity(ACTIVITY_EXECUTE_TRADER, {
        actionType: type,
        actionId: id,
        actionData: data,
        state
      });
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
      eventsToSend = { ...eventsToSend, ...currentEvents };
    } else if (type === STOP) {
      const { currentState, currentOrders } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_TRADER,
        {
          actionType: REQUEST_STOP,
          actionId: id,
          actionData: null,
          state
        }
      );
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
    } else {
      Log.error("Unknown trader action '%s'", type);
    }

    // Если есть ордера для исполнения
    if (Object.keys(ordersToExecute).length > 0) {
      // Исполняем ордера
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_ORDERS,
        {
          data: ordersToExecute,
          state
        }
      );
      // Обновляем стейт
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
    }

    if (state.status === STATUS_STOPPING && !state.hasActivePositions) {
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_TRADER,
        {
          actionType: STOP,
          actionId: null,
          actionData: null,
          state
        }
      );
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
      stop = true;
    }
    // Если есть события для отправки
    if (Object.keys(eventsToSend).length > 0) {
      // Формируем массив из задач по отправке событий
      const eventPublishTasks = Object.values(eventsToSend).map(event =>
        context.df.callActivityWithRetry(ACTIVITY_EVENT_PUBLISH, retryOptions, {
          state: traderStateToCommonProps(state),
          data: event
        })
      );
      try {
        const eventPublishResults = yield context.df.Task.all(
          eventPublishTasks
        );
        const failedEvents = eventPublishResults.filter(res => res === false);
        if (failedEvents.length > 0)
          Log.exception("Failed to publish '%d' events", failedEvents.length);
      } catch (e) {
        throw new ServiceError(
          {
            name: ServiceError.types.TRADER_EVENTS_PUBLISH_ERROR,
            info: {
              error: e
            }
          },
          "Failed to publish events after retries."
        );
      }
    }
    // Сохраняем стейт в сторедж
    try {
      yield context.df.callActivityWithRetry(
        ACTIVITY_SAVE_STATE,
        retryOptions,
        {
          state
        }
      );
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_SAVE_STATE_ERROR,
          info: {
            error: e
          }
        },
        "Failed to save trader state after retries."
      );
    }

    result = state;
  } catch (e) {
    let error;
    let critical;
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      ({ critical } = VError.info(e));
      // Генерируем ошибку оркестрации
      const errorName = critical
        ? ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION
        : ServiceError.types.TRADER_ORCHESTRATOR_ERROR;
      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            critical
          }
        },
        "Trader orchestrator error"
      );
    } else {
      // Если ошибка сгенерирована рантаймом
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            critical: true
          }
        },
        "Trader orchestrator error"
      );
    }

    try {
      // Меняем стейт
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_TRADER,
        { actionType: ERROR, actionId: null, actionData: error.json, state }
      );
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
    } catch (updateStateError) {
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
          cause: error,
          info: {
            ...traderStateToCommonProps(state),
            error: updateStateError
          }
        },
        "Failed to update trader state while handling orchestrator error."
      );
    }
    // Cохраняем стейт
    try {
      yield context.df.callActivityWithRetry(
        ACTIVITY_SAVE_STATE,
        retryOptions,
        {
          state
        }
      );
    } catch (saveStateError) {
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
          cause: error,
          info: {
            ...traderStateToCommonProps(state),
            error: saveStateError
          }
        },
        "Failed to save state while handling orchestrator error."
      );
    }

    // Если есть события для отправки
    if (Object.keys(eventsToSend).length > 0) {
      // Формируем массив из задач по отправке событий
      const eventPublishTasks = Object.values(eventsToSend).map(event =>
        context.df.callActivityWithRetry(ACTIVITY_EVENT_PUBLISH, retryOptions, {
          state: traderStateToCommonProps(state),
          data: event
        })
      );
      try {
        const eventPublishResults = yield context.df.Task.all(
          eventPublishTasks
        );
        const failedEvents = eventPublishResults.filter(res => res === false);
        if (failedEvents.length > 0)
          Log.exception("Failed to publish '%d' events", failedEvents.length);
      } catch (eventsPublishError) {
        error = new ServiceError(
          {
            name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
            cause: error,
            info: {
              ...traderStateToCommonProps(state),
              error: eventsPublishError
            }
          },
          "Failed to publish events while handling orchestrator error."
        );
      }
    }

    Log.exception(error);
    result = error.toString(true);
  }
  Log.clearContext();
  // Если трейдер не остановлен - перезапускаем оркестратор с текущим стейтом
  if (!stop) {
    yield context.df.continueAsNew(state);
  } else {
    context.df.setCustomStatus(STOPPED);
  }
  return result;
});

export default orchestrator;
