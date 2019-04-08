import * as df from "durable-functions";
import VError from "verror";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { STATUS_STOPPED } from "cpz/config/state";
import {
  ERROR_TRADER_ERROR_EVENT,
  ERROR_TRADER_WARN_EVENT
} from "cpz/events/types";
import { SERVICE_NAME, FUNCTIONS, INTERNAL } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

const {
  ACTIVITY_EVENT_PUBLISH,
  ACTIVITY_EXECUTE_ORDERS,
  ACTIVITY_GET_CURRENT_RPICE,

  ACTIVITY_LOAD_ACTION,
  ACTIVITY_SAVE_STATE,

  ACTIVITY_EXECUTE_TRADER
} = FUNCTIONS;

const {
  actions: {
    START,
    UPDATE,
    STOP,
    SIGNAL,
    PRICE,
    CHECK,
    ORDERS,
    CLOSE_ACTIVE_POSITIONS
  },

  status: { READY, BUSY },
  events: { TRADER_ACTION }
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
  // Текущий стейт трейдера сохранен в сторедж
  let stateSaved = false;
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
      // Ждем внешних эвентов
      Log.debug("Waiting for external event");
      nextAction = yield context.df.waitForExternalEvent(TRADER_ACTION);
    }

    // Если действие уже обработано, выходим
    if (state.lastAction && nextAction.id === state.lastAction.actionId) {
      Log.warn("Action '%s' have already been processed", nextAction.id);
      yield context.df.continueAsNew(state);
      return state;
    }

    // Если есть новое действие (или пришел внешний эвент с действием)
    // Устанавливаем стутс - занят
    context.df.setCustomStatus(BUSY);
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
          actionType: CLOSE_ACTIVE_POSITIONS,
          actionId: id,
          actionData: null,
          state
        }
      );
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
      stop = true;
    } else {
      Log.error("Unknown trader action '%s'", type);
    }

    // Если есть ордера для исполнения
    while (Object.keys(ordersToExecute).length > 0) {
      // Формируем массив из задач по исполнению ордеров

      /* eslint-disable no-loop-func */
      const orderExecuteTasks = Object.values(ordersToExecute).map(order =>
        context.df.callActivityWithRetry(
          ACTIVITY_EXECUTE_ORDERS,
          retryOptions,
          {
            state,
            data: order
          }
        )
      );
      /* no-loop-func */
      // Исполняем ордера параллельно
      let executedOrders = [];
      try {
        executedOrders = yield context.df.Task.all(orderExecuteTasks);
      } catch (e) {
        throw new ServiceError(
          {
            name: ServiceError.types.TRADER_EXECUTE_ORDER_ERROR,
            info: {
              error: e
            }
          },
          "Failed to execute orders after retries."
        );
      }
      // Обрабатываем результат исполнения ордеров
      const {
        currentState,
        currentEvents,
        currentOrders
      } = yield context.df.callActivity(ACTIVITY_EXECUTE_TRADER, {
        actionType: ORDERS,
        actionId: null,
        actionData: executedOrders.filter(({ task }) => !task), // только исполненные ордера
        state
      });
      // Обновляем стейт
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
      ordersToExecute = currentOrders;
    }

    if (stop) {
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_TRADER,
        { actionType: STOP, actionId: null, actionData: null, state }
      );
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
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
      stateSaved = yield context.df.callActivityWithRetry(
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
    // Если ошибка сгенерирована сервисом
    if (e instanceof ServiceError) {
      // Провеярем флаг - критическая ошибка
      const { critical } = VError.info(e);
      // Если критическая - останавливаем оркестрацию
      if (critical) stop = true;
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
      // Считаем что ошибка критическая - останавливаем оркестрацию
      stop = true;
    }
    Log.exception(error);
    // Если нужно остановить оркестрацию
    if (stop && state.status !== STATUS_STOPPED) {
      // Меняем стейт
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_EXECUTE_TRADER,
        { actionType: STOP, actionId: null, actionData: null, state }
      );
      state = currentState;
      // Устанавливаем флаг - необходимо сохранить стейт
      stateSaved = false;
      eventsToSend = { ...eventsToSend, ...currentEvents };
    }

    // Если стейт еще не сохранен - сохраняем
    if (!stateSaved) {
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
    }

    // Отправляем события
    try {
      yield context.df.callActivityWithRetry(
        ACTIVITY_EVENT_PUBLISH,
        retryOptions,
        {
          state: traderStateToCommonProps(state),
          data: {
            eventType: stop
              ? ERROR_TRADER_ERROR_EVENT
              : ERROR_TRADER_WARN_EVENT,
            eventData: {
              subject: state.taskId,
              data: {
                taskId: state.taskId,
                error: error.json
              }
            }
          }
        }
      );
    } catch (eventPublishError) {
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
          cause: error,
          info: {
            ...traderStateToCommonProps(state),
            error: eventPublishError
          }
        },
        "Failed to send events while handling orchestrator error."
      );
      Log.exception(error);
    }
    // Логгируем исключение
    Log.exception(error);
    result = error.json;
  }
  Log.clearContext();
  // Если трейдер не остановлен - перезапускаем оркестратор с текущим стейтом
  if (!stop) yield context.df.continueAsNew(state);
  return result;
});

export default orchestrator;
