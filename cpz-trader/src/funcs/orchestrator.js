import * as df from "durable-functions";
import VError from "verror";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import {
  ERROR_TRADER_ERROR_EVENT,
  ERROR_TRADER_WARN_EVENT
} from "cpz/events/types";
import { SERVICE_NAME, FUNCTIONS, INTERNAL } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

const {
  ACTIVITY_CHECK_PRICE,
  ACTIVITY_CLOSE_ACTIVE_POSITIONS,
  ACTIVITY_DELETE_ACTION,
  ACTIVITY_EVENT_PUBLISH,
  ACTIVITY_EXECUTE_ORDERS,
  ACTIVITY_GET_CURRENT_RPICE,
  ACTIVITY_HANDLE_ORDERS,
  ACTIVITY_HANDLE_SIGNAL,
  ACTIVITY_LOAD_ACTION,
  ACTIVITY_SAVE_STATE,
  ACTIVITY_START_TRADER,
  ACTIVITY_STOP_TRADER,
  ACTIVITY_UPDATE_TRADER
} = FUNCTIONS;

const {
  actions: { START, UPDATE, STOP, SIGNAL, PRICE, CHECK },

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
  // Признак действия из очереди
  let isQueueAction = false;
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
      { state: traderStateToCommonProps(state) }
    );
    isQueueAction = !!nextAction;

    // Если новых действие нет
    if (!nextAction) {
      // Устанавливаем статус - готов
      context.df.setCustomStatus(READY);
      // Ждем внешних эвентов
      Log.debug("Waiting for external event");
      nextAction = yield context.df.waitForExternalEvent(TRADER_ACTION);
    }
    // Если есть новое действие (или пришел внешний эвент с действием)
    // Устанавливаем стутс - занят
    context.df.setCustomStatus(BUSY);
    // Проверяем тип действия
    const { type, data } = nextAction;
    if (type === PRICE) {
      // Проверка позиций по новой цене
      // Проверка цены, с указаним цены из эвента
      const { currentState, currentOrders } = yield context.df.callActivity(
        ACTIVITY_CHECK_PRICE,
        { state, data }
      );
      // Обновление стейта
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
    } else if (type === CHECK) {
      // Проверка позиций по текущей цене
      // Загрузка текущей цены из стореджа
      let currentPrice;
      try {
        currentPrice = yield context.df.callActivityWithRetry(
          ACTIVITY_GET_CURRENT_RPICE,
          retryOptions,
          {
            state: traderStateToCommonProps(state),
            data: {
              exchange: state.exchange,
              asset: state.asset,
              currency: state.currency
            }
          }
        );
      } catch (e) {
        throw new ServiceError(
          {
            name: ServiceError.types.TRADER_GET_CURRENT_PRICE_ERROR,
            info: {
              error: e
            }
          },
          "Failed to get current price after retries."
        );
      }
      // Проверка цены, с указанием цены из стореджа
      const { currentState, currentOrders } = yield context.df.callActivit(
        ACTIVITY_CHECK_PRICE,
        { state, data: currentPrice }
      );
      // Обновление стейта
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
    } else if (type === SIGNAL) {
      // Обработка нового сигнала
      const { currentState, currentOrders } = yield context.df.callActivity(
        ACTIVITY_HANDLE_SIGNAL,
        { state, data }
      );
      // Обновление стейта
      state = currentState;
      ordersToExecute = { ...ordersToExecute, ...currentOrders };
    } else if (type === START) {
      // Формирование события о запуске
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_START_TRADER,
        { state }
      );
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
    } else if (type === UPDATE) {
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_UPDATE_TRADER,
        {
          state,
          data: data.settings
        }
      );
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
    } else if (type === STOP) {
      const { currentState, currentOrders } = yield context.df.callActivity(
        ACTIVITY_CLOSE_ACTIVE_POSITIONS,
        {
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
            state: traderStateToCommonProps(state),
            data: order
          }
        )
      );
      /* no-loop-func */
      // Исполняем ордера параллельно
      const executedOrders = yield context.df.Task.all(orderExecuteTasks);
      // Обрабатываем результат исполнения ордеров
      const {
        currentState,
        currentEvents,
        currentOrders
      } = yield context.df.callActivity(ACTIVITY_HANDLE_ORDERS, {
        state: traderStateToCommonProps(state),
        data: executedOrders.filter(({ task }) => !!task)
      });
      // Обновляем стейт
      state = currentState;
      eventsToSend = { ...eventsToSend, ...currentEvents };
      ordersToExecute = currentOrders;
    }

    if (stop) {
      const { currentState, currentEvents } = yield context.df.callActivity(
        ACTIVITY_STOP_TRADER,
        { state }
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
      yield context.df.Task.all(eventPublishTasks);
    }
    // Сохраняем стейт в сторедж
    stateSaved = yield context.df.callActivityWithRetry(
      ACTIVITY_SAVE_STATE,
      retryOptions,
      {
        state
      }
    );

    // Если задача трейдера из очереди, удаляем элемент из очереди
    if (isQueueAction)
      yield context.df.callActivityWithRetry(
        ACTIVITY_DELETE_ACTION,
        retryOptions,
        { state: traderStateToCommonProps(state), data: nextAction }
      );

    result = state;
  } catch (e) {
    if (!stateSaved)
      yield context.df.callActivityWithRetry(
        ACTIVITY_SAVE_STATE,
        retryOptions,
        {
          state
        }
      );
    let error;
    if (e instanceof ServiceError) {
      const { critical } = VError.info(e);
      const errorName = critical
        ? ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION
        : ServiceError.types.TRADER_ORCHESTRATOR_ERROR;
      error = new ServiceError(
        {
          name: errorName,
          cause: e,
          info: {
            ...traderStateToCommonProps(state)
          }
        },
        "Trader orchestrator error"
      );

      if (critical) stop = true;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.TRADER_ORCHESTRATOR_EXCEPTION,
          info: {
            ...traderStateToCommonProps(state),
            error: e
          }
        },
        "Trader orchestrator error"
      );
      stop = true;
    }
    Log.exception(error);
    yield context.df.callActivityWithRetry(
      ACTIVITY_EVENT_PUBLISH,
      retryOptions,
      {
        state: traderStateToCommonProps(state),
        data: {
          eventType: stop ? ERROR_TRADER_ERROR_EVENT : ERROR_TRADER_WARN_EVENT,
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
    result = error;
  }
  Log.clearContext();
  // Если трейдер не остановлен - перезапускаем оркестратор с текущим стейтом
  if (!stop) yield context.df.continueAsNew(state);
  return result;
});

export { orchestrator };
