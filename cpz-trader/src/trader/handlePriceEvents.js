import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { createTraderSlug } from "cpzStorage/utils";
import {
  TICKS_NEWTICK_EVENT,
  CANDLES_NEWCANDLE_EVENT,
  // PRICES_NEWPRICE,
  ERROR_TRADER_EVENT,
  TRADES_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { subjectToStr } from "cpzUtils/helpers";
import { getActivePositions, getTraderByKey } from "../tableStorage";
import Position from "./position";

// const validateNewPrice = createValidator(PRICES_NEWPRICE.dataSchema);
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
    // Валидация входных параметров
    // genErrorIfExist(validateNewPrice(eventData.currentPrice)); //пока не актуально
    const { eventSubject, currentPrice } = eventData;
    const modeStr = subjectToStr(eventSubject);
    // Параметры запроса - биржа + инструмент + таймфрейм
    const slug = createTraderSlug(
      currentPrice.exchange,
      currentPrice.asset,
      currentPrice.currency,
      currentPrice.timeframe,
      modeStr
    );

    const positionsState = await getActivePositions(slug);

    const handlePositionPriceResult = await Promise.all(
      positionsState.map(async state => {
        try {
          const position = new Position(state);
          const requiredOrders = position.getRequiredOrders(currentPrice.price);
          if (requiredOrders.length > 0) {
            const trader = getTraderByKey({
              rowKey: position.traderId,
              partitionKey: position.slug
            });

            await trader.executeOrders(requiredOrders);
            // Если есть хотя бы одно событие для отправка
            if (trader.events.length > 0) {
              // Отправляем
              await publishEvents(context, TRADES_TOPIC, trader.events);
            }
          }
        } catch (error) {
          return {
            isSuccess: false,
            taskId: state.traderId,
            positionId: state.positionId,
            error: createErrorOutput(error)
          };
        }
        return {
          isSuccess: true,
          positionId: state.positionId,
          taskId: state.traderId
        };
      })
    );

    // ? TODO: price handled event
    /* const successPositions = handlePositionPriceResult
      .filter(result => result.isSuccess === true)
      .map(result => ({
        positionId: result.positionId,
        taskId: result.taskId
      })); */

    const errorPositions = handlePositionPriceResult
      .filter(result => result.isSuccess === false)
      .map(result => ({ positionId: result.positionId, error: result.error }));

    if (errorPositions) {
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: errorOutput
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: errorOutput
      }
    });
  }
}

async function handleCandle(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateNewCandle(eventData.candle));
    const { eventSubject, candle } = eventData;
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
            candleId: eventData.candleId
          }
        },
        'Failed to handle new candle "%s"',
        eventData.candleId
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        eventData,
        error: errorOutput
      }
    });
  }
}
export { handleTick, handleCandle };
