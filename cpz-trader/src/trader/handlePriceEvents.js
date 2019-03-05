import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  TICKS_NEWTICK_EVENT,
  CANDLES_NEWCANDLE_EVENT,
  ERROR_TRADER_EVENT,
  TRADES_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import {
  createPositionSlug,
  STATUS_STARTED,
  STATUS_BUSY,
  CANDLE_PREVIOUS
} from "cpzState";
import Log from "cpzLog";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { getTraderById } from "cpzStorage/traders";
import { getActivePositionsBySlug } from "cpzStorage/positions";
import Position from "./position";
import Trader from "./trader";

const validateNewTick = createValidator(TICKS_NEWTICK_EVENT.dataSchema);
const validateNewCandle = createValidator(CANDLES_NEWCANDLE_EVENT.dataSchema);
/**
 * Обработка текущей цены
 *
 * @param {*} context
 * @param {*} price
 */
async function handlePrice(context, eventData) {
  try {
    const { currentPrice } = eventData;
    Log.debug("handlesPrice()", currentPrice.price);
    const positionsState = await getActivePositionsBySlug(
      createPositionSlug({
        exchange: currentPrice.exchange,
        asset: currentPrice.asset,
        currency: currentPrice.currency
      })
    );

    const handlePositionPriceResult = await Promise.all(
      positionsState.map(async state => {
        try {
          const position = new Position(state);
          const requiredOrders = position.getRequiredOrders(currentPrice.price);

          if (requiredOrders.length > 0) {
            const traderState = await getTraderById(position.traderId);

            if (traderState && traderState.status === STATUS_STARTED) {
              const trader = new Trader(context, traderState);
              trader.status = STATUS_BUSY;
              // Если есть запрос на обновление параметров
              if (trader.updateRequested) {
                // Обновляем параметры
                trader.setUpdate();
              }
              trader.handlePrice({
                price: currentPrice.price,
                timestamp: currentPrice.timestamp
              });
              await trader.save();
              try {
                await trader.executeOrders(requiredOrders);

                // Если есть хотя бы одно событие для отправка
                if (trader.events.length > 0) {
                  // Отправляем
                  await publishEvents(TRADES_TOPIC, trader.events);
                }
                await trader.end(STATUS_STARTED);
              } catch (error) {
                Log.error(error);
                trader.end(STATUS_STARTED, error);
              }
            }
          }
        } catch (error) {
          Log.error(error);
          return {
            success: false,
            taskId: state.traderId,
            positionId: state.positionId,
            error: createErrorOutput(error)
          };
        }
        return {
          success: true,
          positionId: state.positionId,
          taskId: state.traderId
        };
      })
    );

    // ? TODO: price handled event
    /* const successPositions = handlePositionPriceResult
      .filter(result => result.success === true)
      .map(result => ({
        positionId: result.positionId,
        taskId: result.taskId
      })); */

    const errorPositions = handlePositionPriceResult
      .filter(result => result.success === false)
      .map(result => ({ positionId: result.positionId, error: result.error }));

    if (errorPositions && errorPositions.length > 0) {
      throw new VError(
        {
          name: "TradersExecutionError",
          info: {
            errorPositions
          }
        },
        "Failed to execute traders"
      );
    }
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to handle current price"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function handleTick(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateNewTick(eventData.tick));
    const { eventSubject, tick } = eventData;
    const currentPrice = {
      exchange: tick.exchange,
      asset: tick.asset,
      currency: tick.currency,
      time: tick.time,
      timestamp: tick.timestamp,
      price: tick.price
    };
    await handlePrice(context, {
      eventSubject,
      currentPrice
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            tradeId: eventData.tradeId
          }
        },
        'Failed to handle new tick "%s"',
        eventData.tradeId
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function handleCandle(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateNewCandle(eventData.candle));
    const { eventSubject, candle } = eventData;
    /* Если свеча сгенерирована по предыдущим данным - пропускаем */
    if (candle.type === CANDLE_PREVIOUS) return;
    const currentPrice = {
      exchange: candle.exchange,
      asset: candle.asset,
      currency: candle.currency,
      time: candle.time,
      timestamp: candle.timestamp,
      price: candle.close
    };
    await handlePrice(context, {
      eventSubject,
      currentPrice
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            candleId: eventData.id
          }
        },
        'Failed to handle new candle "%s"',
        eventData.id
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}
export { handleTick, handleCandle };
