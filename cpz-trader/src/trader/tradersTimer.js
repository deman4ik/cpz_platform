import { getActiveTradersWithStopRequested } from "cpzStorage";
import VError from "verror";
import { createErrorOutput } from "cpzUtils/error";

import {
  ERROR_TRADER_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  ERROR_TOPIC,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createTraderTaskSubject } from "cpzState";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import Trader from "./trader";

async function handleTimer(context) {
  try {
    const tradersState = await getActiveTradersWithStopRequested();

    if (tradersState.length === 0) return;

    const handleTradersToStopResult = await Promise.all(
      tradersState.map(async state => {
        try {
          const trader = new Trader(state);
          await trader.save();
          await trader.closeActivePositions();
          // Публикуем событие - успех
          await publishEvents(TASKS_TOPIC, {
            service: TRADER_SERVICE,
            subject: createTraderTaskSubject({
              exchange: state.exchange,
              asset: state.asset,
              currency: state.currency,
              timeframe: state.timeframe,
              robotId: state.robotId,
              userId: state.userId
            }),
            eventType: TASKS_TRADER_STOPPED_EVENT,
            data: {
              taskId: state.taskId
            }
          });
        } catch (error) {
          const errorOutput = createErrorOutput(error);
          return {
            success: false,
            taskId: state.traderId,
            error: {
              name: errorOutput.name,
              message: errorOutput.message,
              info: errorOutput.info
            }
          };
        }
        return {
          success: true,
          taskId: state.traderId
        };
      })
    );

    const errorTraders = handleTradersToStopResult
      .filter(result => result.success === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));

    if (errorTraders && errorTraders.length > 0) {
      throw new VError(
        {
          name: "TradersStopError",
          info: {
            errorTraders
          }
        },
        "Failed to stop traders"
      );
    }
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error
        },
        "Failed to handle trader timer"
      )
    );
    context.log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: "Trader.StopRequested.Timer",
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
