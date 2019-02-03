import dayjs from "cpzDayjs";
import VError from "verror";
import { v4 as uuid } from "uuid";
import { TRADER_SERVICE } from "cpzServices";
import {
  REALTIME_MODE,
  BACKTEST_MODE,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  TRADE_ACTION_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  TRADE_ACTION_CLOSE_LONG,
  POS_STATUS_NEW,
  POS_STATUS_CANCELED,
  POS_STATUS_CLOSED,
  POS_STATUS_OPEN,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT,
  createTraderSlug,
  createPositionSlug,
  createCurrentPriceSlug
} from "cpzState";
import publishEvents from "cpzEvents";
import { combineTraderSettings } from "cpzUtils/settings";
import { LOG_TRADER_EVENT, LOG_TOPIC } from "cpzEventTypes";
import { saveTraderState } from "cpzStorage/traders";
import { getCurrentPrice } from "cpzStorage/currentPrices";
import {
  getPosition,
  getActivePositionsBySlugAndTraderId
} from "cpzStorage/positions";
import { checkOrderEX, cancelOrderEX, createOrderEX } from "cpzConnector";
import Position from "./position";

/**
 * Класс проторговщика
 *
 * @class Trader
 */
class Trader {
  /**
   * Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Идентификатор пользователя */
    this._userId = state.userId;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    this._settings = combineTraderSettings(state.settings);
    /* Текущий сигнал */
    this._signal = {};
    /* Последнтй сигнал */
    this._lastSignal = state.lastSignal || { signalId: null };
    this._currentPositions = {};
    /* Объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false */
    this._updateRequested = state.updateRequested || false;
    /* Признак запроса на остановку сервиса [true,false] */
    this._stopRequested = state.stopRequested || false;
    /* Текущий статус сервиса */
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = state.startedAt || dayjs().toJSON();
    /* Дата и время остановки */
    this._endedAt = this._stopRequested
      ? dayjs().toJSON()
      : state.endedAt || "";
    /* События для отправки */
    this._events = [];

    /* Метаданные стореджа */
    this._metadata = state.metadata;
    this.log("Initialized");
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof  Trader
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Trader
   */
  get updateRequested() {
    return this._updateRequested;
  }

  /**
   * События
   *
   * @readonly
   * @memberof Position
   */
  get events() {
    return this._events;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Trader
   */
  set status(status) {
    if (status) this._status = status;
    if (this._status === STATUS_STOPPED || this._status === STATUS_FINISHED)
      this._endedAt = dayjs().toJSON();
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Trader
   */
  log(...args) {
    if (this._settings.debug) {
      this._context.log.info(`Trader ${this._eventSubject}:`, ...args);
    }
  }

  logError(...args) {
    this._context.log.error(`Trader ${this._eventSubject}:`, ...args);
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Trader
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(LOG_TOPIC, {
      service: TRADER_SERVICE,
      subject: this._eventSubject,
      eventType: LOG_TRADER_EVENT,
      data: {
        taskId: this._taskId,
        ...data
      }
    });
  }

  /**
   * Аварийная остановка проторговщика
   *
   * @param {*} msg
   * @memberof Trader
   */
  crash(msg) {
    throw new VError(
      {
        name: "TraderCrashError"
      },
      'Critical error while executing trader "%s" for user "%s" - "%s"',
      this._taskId,
      this._userId,
      msg
    );
  }

  async closePosition(price, positionState) {
    try {
      const closeSignal = {
        price,
        orderType: ORDER_TYPE_MARKET,
        signalId: uuid(),
        positionId: positionState.positionId
      };
      if (positionState.direction === ORDER_DIRECTION_BUY) {
        closeSignal.action = TRADE_ACTION_CLOSE_LONG;
      } else {
        closeSignal.action = TRADE_ACTION_CLOSE_SHORT;
      }
      await this.handleSignal(closeSignal);
    } catch (error) {
      throw new VError(
        {
          name: "ClosePosition",
          cause: error
        },
        "Failed to close active position"
      );
    }
  }

  async closeActivePositions() {
    try {
      const positionsState = await getActivePositionsBySlugAndTraderId({
        slug: createPositionSlug({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        }),
        traderId: this._taskId
      });

      if (positionsState.length > 0) {
        const price = await getCurrentPrice(
          createCurrentPriceSlug({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency
          })
        );

        /* eslint-disable no-restricted-syntax, no-await-in-loop */
        for (const positionState of positionsState) {
          await this.closePosition(price, positionState);
        }
        /* no-restricted-syntax, no-await-in-loop */
      }
    } catch (error) {
      throw new VError(
        {
          name: "CloseActivePositions",
          cause: error
        },
        "Failed to close active positions"
      );
    }
  }

  /**
   *Создание новой позиции
   *
   * @param {*} positionId
   * @memberof Trader
   */
  _createPosition(positionId) {
    this.log(
      "Creating new Position",
      this._signal.settings.positionCode,
      positionId
    );
    this._currentPositions[positionId] = new Position({
      positionId,
      traderId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      direction:
        this._signal.action === TRADE_ACTION_LONG
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL,
      settings: { ...this._settings, ...this._signal.settings },
      log: this.log.bind(this),
      logEvent: this.logEvent.bind(this)
    });
  }

  /**
   * Загрузка существующей позиции
   *
   * @memberof Trader
   */
  async _loadPosition(positionId) {
    this.log(`Loading position ${positionId}...`);
    try {
      // Если позиция еще не загружена
      if (
        !Object.prototype.hasOwnProperty.call(
          this._currentPositions,
          positionId
        )
      ) {
        // Запрашиваем из стореджа
        const positionState = await getPosition({
          slug: createPositionSlug({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency
          }),
          traderId: this._taskId,
          positionId
        });
        // Создем экземпяр позиции
        this._currentPositions[positionState.positionId] = new Position({
          ...positionState,
          log: this.log.bind(this),
          logEvent: this.logEvent.bind(this)
        });
      }
    } catch (error) {
      throw new VError(
        {
          name: "PositionNotFound",
          cause: error,
          info: {
            positionId
          }
        },
        'Error while loading position id "%s"',
        positionId
      );
    }
  }

  handlePrice({ price, timestamp }) {
    this._lastPrice = price;
    this._lastPriceTimestamp = timestamp;
  }

  /**
   * Обработка нового сигнала
   *
   * @param {*} signal
   * @memberof Trader
   */
  async handleSignal(signal) {
    try {
      this.log(
        `handleSignal() position: ${signal.settings.positionCode}, ${
          signal.action
        }, ${signal.price}, from ${signal.priceSource}`
      );
      // Обновить текущий сигнал
      this._signal = signal;
      // Если сигнал уже обрабатывалась - выходим
      if (this._signal.signalId === this._lastSignal.signalId) return;
      // Если сигнал на открытие позиции
      if (
        this._signal.action === TRADE_ACTION_LONG ||
        this._signal.action === TRADE_ACTION_SHORT
      ) {
        if (!this._settings.multiPosition) {
          if (this._settings.mode === BACKTEST_MODE) {
            if (Object.keys(this._currentPositions).length > 0) {
              const activePositions = Object.keys(this._currentPositions)
                .map(key => ({
                  positionId: this._currentPositions[key]._positionId,
                  positionCode: this._currentPositions[key]._settings
                    .positionCode,
                  status: this._currentPositions[key]._status
                }))
                .filter(
                  position =>
                    position.status === POS_STATUS_NEW ||
                    position.status === POS_STATUS_OPEN
                );
              if (activePositions.length > 0) {
                throw new VError(
                  {
                    name: "CreatePositionError",
                    info: {
                      activePositions
                    }
                  },
                  "Failed to create new position, active positions found"
                );
              }
            }
          } else {
            // In realtime and emulation - closing all active positions
            await this.closeActivePositions();
          }
        }

        // Создаем новую позицию
        this._createPosition(this._signal.positionId);
        // Создаем ордер на открытие позиции
        this._currentPositions[this._signal.positionId].createEntryOrder(
          this._signal
        );
      } else {
        // Если сигнал на закрытие позиции

        // Загружаем существующую позицию
        await this._loadPosition(this._signal.positionId);
        // Создаем ордер на закрытие позиции
        this._currentPositions[this._signal.positionId].createExitOrder(
          this._signal
        );
        // Если текущая позиция еще не открыта
        if (
          this._currentPositions[this._signal.positionId].status ===
          POS_STATUS_NEW
        ) {
          // Отменяем позицию
          this._currentPositions[
            this._signal.positionId
          ].status = POS_STATUS_CANCELED;
        }
      }
      if (
        this._currentPositions[this._signal.positionId].status !==
          POS_STATUS_CANCELED &&
        this._currentPositions[this._signal.positionId].status !==
          POS_STATUS_CLOSED
      ) {
        // Созданный ордер
        const createdOrder = this._currentPositions[this._signal.positionId]
          .currentOrder;
        // Если есть задача для ордера
        if (createdOrder.task) {
          // Немедленно исполянем ордер
          await this.executeOrders([createdOrder]);
        } else {
          // Если любой другой тип ордера
          // Сохраняем позицию в сторедж
          await this._currentPositions[this._signal.positionId].save();
        }
      }
      // Последний обработанный сигнал
      this._lastSignal = this._signal;
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            adviserId: this._adviserId,
            userId: this._userId,
            eventSubject: this._eventSubject
          }
        },
        'Error while handling signal trader "%s"',
        this._taskId
      );
    }
  }

  /**
   * Исполнение ордеров
   *
   * @param {*} orders
   */
  async executeOrders(orders) {
    this.log("Executiong orders...");
    // Для каждого ордера
    /* eslint-disable no-restricted-syntax */
    for (const order of orders) {
      /* eslint-disable no-await-in-loop */
      try {
        let orderResult = { ...order };
        // Если задача - проверить исполнения объема
        if (order.task === ORDER_TASK_CHECKLIMIT) {
          // Если режим - в реальном времени
          if (this._settings.mode === REALTIME_MODE) {
            // Запрашиваем статус ордера с биржи
            let currentOrder = await checkOrderEX({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              userId: this._userId,
              keys: this._settings.keys,
              exId: order.exId
            });
            this.log("checkOrderEX", currentOrder);

            if (
              currentOrder.status === ORDER_STATUS_OPEN &&
              dayjs().diff(dayjs(currentOrder.exTimestamp), "minute") >
                this._settings.openOrderTimeout
            ) {
              currentOrder = await cancelOrderEX({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                userId: this._userId,
                keys: this._settings.keys,
                exId: order.exId
              });
              this.log("cancelOrderEX", currentOrder);
            }
            orderResult = { ...orderResult, ...currentOrder };
          } else {
            // Если режим - эмуляция или бэктест
            // Считаем, что ордер исполнен
            orderResult.status = ORDER_STATUS_CLOSED;
            // Полностью - т.е. по заданному объему
            orderResult.executed = order.volume;
          }
          // Если задача - выставить лимитный или рыночный ордер
        } else if (
          order.task === ORDER_TASK_SETLIMIT ||
          order.task === ORDER_TASK_OPENBYMARKET
        ) {
          // Устанавливаем объем из параметров
          const orderToExecute = { ...order };
          // Если режим - в реальном времени
          if (this._settings.mode === REALTIME_MODE) {
            // Публикуем ордер на биржу
            const currentOrder = await createOrderEX({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              userId: this._userId,
              keys: this._settings.keys,
              order: {
                direction: orderToExecute.direction,
                volume: orderToExecute.volume,
                price: orderToExecute.price,
                params: {} // TODO
              }
            });
            this.log("createOrderEX", currentOrder);
            orderResult = {
              ...orderResult,
              ...currentOrder,
              status: ORDER_STATUS_OPEN,
              candleTimestamp: dayjs()
                .utc()
                .add(-this._timeframe, "minute")
                .startOf("minute")
                .toISOString()
            };
          } else if (order.orderType === ORDER_TYPE_LIMIT) {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - лимитный
            // Считаем, что ордер успешно выставлен на биржу
            orderResult.status = ORDER_STATUS_OPEN;
            orderResult.exLastTrade = this._lastPriceTimestamp;
            orderResult.average = this._lastPrice;
          } else if (order.orderType === ORDER_TYPE_MARKET) {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - по рынку
            // Считаем, что ордер исполнен
            orderResult.status = ORDER_STATUS_CLOSED;
            // Полностью - т.е. по заданному объему
            orderResult.executed = orderToExecute.volume;
            orderResult.exLastTrade = this._lastPriceTimestamp;
            orderResult.average = orderResult.price;
          }
        }
        // Загружаем позицию
        await this._loadPosition(order.positionId);

        // Сохраняем ордер в позиции и генерируем события
        this._events.push(
          this._currentPositions[order.positionId].handleOrder(orderResult)
        );
        this._events.push(
          this._currentPositions[order.positionId].createPositionEvent()
        );
        // Сохраняем состояние позиции в сторедж
        await this._currentPositions[order.positionId].save();
      } catch (error) {
        throw new VError(
          {
            name: "ExecutingOrder",
            cause: error,
            info: {
              order
            }
          },
          'Error while executing order "%s"',
          order.orderId
        );
      }
      /* eslint-disable no-await-in-loop */
    }
    /* eslint-disable no-restricted-syntax */
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Trader
   */
  getCurrentState() {
    return {
      PartitionKey: createTraderSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId
      }),
      RowKey: this._taskId,
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      settings: this._settings,
      lastSignal: this._lastSignal,
      updateRequested: this._updateRequested,
      stopRequested: this._stopRequested,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata
    };
  }

  /**
   * Установка новых параметров
   *
   * @param {object} [updatedFields=this._updateRequested]
   * @memberof Trader
   */
  setUpdate(updatedFields = this._updateRequested) {
    this._settings = {
      debug: updatedFields.debug || this._settings.debug,
      slippageStep: updatedFields.slippageStep || this._settings.slippageStep,
      deviation: updatedFields.deviation || this._settings.deviation,
      volume: updatedFields.volume || this._settings.volume
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Trader
   */
  async save() {
    try {
      // Сохраняем состояние в локальном хранилище
      await saveTraderState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            userId: this._userId,
            adviserId: this._adviserId,
            eventSubject: this._eventSubject
          }
        },
        'Failed to update trader "%s" state',
        this._taskId
      );
    }
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Trader
   */
  async end(status, error) {
    try {
      this.log(`Finished execution! Current status: ${status}`);
      this._status = status;
      this._error = error
        ? {
            name: error.name,
            message: error.message,
            info: error.info
          }
        : null;
      if (this._error) {
        this.logError(error);
      }
      this._updateRequested = false; // Обнуляем запрос на обновление параметров
      this._stopRequested = false; // Обнуляем запрос на остановку сервиса

      await this.save();
    } catch (err) {
      if (err instanceof VError) {
        throw err;
      } else {
        throw new VError(
          {
            name: "TraderError",
            cause: err
          },
          'Failed to end trader "%s" execution',
          this._taskId
        );
      }
    }
  }
}

export default Trader;
