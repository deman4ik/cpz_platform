import { getIdledOpenPositions, getTraderById } from "cpzStorage";
import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";

import { ERROR_TRADER_EVENT, ERROR_TOPIC, TRADES_TOPIC } from "cpzEventTypes";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import Position from "./position";

async function handleTimer(context) {
  try {
    const positionsState = await getIdledOpenPositions();

    const handlePositionIdleOrdersResult = await Promise.all(
      positionsState.map(async state => {
        try {
          const position = new Position(state);
          const openOrders = position.getOpenOrders();
          if (openOrders.length > 0) {
            const trader = getTraderById(position.traderId);
            if (trader.status === STATUS_STARTED) {
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

    const errorPositions = handlePositionIdleOrdersResult
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
          cause: error
        },
        "Failed to handle timer"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: "Trader.Timer",
      eventType: ERROR_TRADER_EVENT,
      data: {
        error: errorOutput
      }
    });
  }
}

export default handleTimer;