import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";

import { ERROR_TRADER_EVENT, ERROR_TOPIC, TRADES_TOPIC } from "cpzEventTypes";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import publishEvents from "cpzEvents";
import { getTraderById } from "cpzStorage/traders";
import Log from "cpzLog";
import { getIdledOpenPositions } from "cpzStorage/positions";
import { TRADER_SERVICE } from "cpzServices";
import Position from "./position";
import Trader from "./trader";

async function handleTimer(context) {
  try {
    const positionsState = await getIdledOpenPositions();

    if (positionsState.length === 0) return;

    const handlePositionIdleOrdersResult = await Promise.all(
      positionsState.map(async state => {
        try {
          const position = new Position(state);
          const openOrders = position.getOpenOrders();
          if (openOrders.length > 0) {
            const traderState = await getTraderById(position.traderId);
            if (traderState && traderState.status === STATUS_STARTED) {
              const trader = new Trader(context, traderState);
              trader.status = STATUS_BUSY;
              await trader.save();
              await trader.executeOrders(openOrders);

              // Если есть хотя бы одно событие для отправка
              if (trader.events.length > 0) {
                // Отправляем
                await publishEvents(TRADES_TOPIC, trader.events);
              }
              await trader.end(STATUS_STARTED);
            }
          }
        } catch (error) {
          const errorOutput = createErrorOutput(error);
          return {
            success: false,
            taskId: state.traderId,
            positionId: state.positionId,
            error: {
              name: errorOutput.name,
              message: errorOutput.message,
              info: errorOutput.info
            }
          };
        }
        return {
          success: true,
          positionId: state.positionId,
          taskId: state.traderId
        };
      })
    );

    const errorPositions = handlePositionIdleOrdersResult
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
          cause: error
        },
        "Failed to handle timer"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: "Trader.Positions.Timer",
      eventType: ERROR_TRADER_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

export default handleTimer;
