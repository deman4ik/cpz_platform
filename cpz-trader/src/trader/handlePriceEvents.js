import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";
import { ERROR_TOPIC, ERROR_TRADER_EVENT, TRADES_TOPIC } from "cpzEventTypes";
import {
  CANDLE_PREVIOUS,
  createPositionSlug,
  STATUS_BUSY,
  STATUS_STARTED
} from "cpzState";
import Log from "cpzLog";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { getTraderById } from "cpzStorage/traders";
import { getActivePositionsBySlug } from "cpzStorage/positions";
import Position from "./position";
import Trader from "./trader";

/**
 * Обработка текущей цены
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handlePrice(context, eventData) {
  const {
    subject,
    currentPrice: { exchange, asset, currency, price, timestamp }
  } = eventData;
  try {
    Log.debug("handlesPrice()", price);
    const positionsState = await getActivePositionsBySlug(
      createPositionSlug({
        exchange,
        asset,
        currency
      })
    );

    const handlePositionPriceResult = await Promise.all(
      positionsState.map(async state => {
        try {
          const position = new Position(state);
          const requiredOrders = position.getRequiredOrders(price);

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
                price,
                timestamp
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
                await trader.end(STATUS_STARTED, error);
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
      subject,
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
  const {
    subject,
    exchange,
    asset,
    currency,
    time,
    timestamp,
    price,
    tradeId
  } = eventData;
  try {
    const currentPrice = {
      exchange,
      asset,
      currency,
      time,
      timestamp,
      price
    };
    await handlePrice(context, {
      subject,
      currentPrice
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            tradeId
          }
        },
        'Failed to handle new tick "%s"',
        tradeId
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject,
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
  const {
    subject,
    id,
    type,
    exchange,
    asset,
    currency,
    time,
    timestamp,
    price
  } = eventData;
  try {
    /* Если свеча сгенерирована по предыдущим данным - пропускаем */
    if (type === CANDLE_PREVIOUS) return;
    const currentPrice = {
      exchange,
      asset,
      currency,
      time,
      timestamp,
      price
    };
    await handlePrice(context, {
      subject,
      currentPrice
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            candleId: id
          }
        },
        'Failed to handle new candle "%s"',
        id
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject,
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
