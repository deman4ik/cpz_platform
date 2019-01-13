import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_BUSY,
  createTraderTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { findTrader, getTraderById } from "cpzStorage";
import BaseRunner from "../baseRunner";

const validateStart = createValidator(TASKS_TRADER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_TRADER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(TASKS_TRADER_UPDATE_EVENT.dataSchema);

class TraderRunner extends BaseRunner {
  static async start(context, props) {
    try {
      const taskId = uuid();

      genErrorIfExist(validateStart({ ...props, taskId }));
      const {
        robotId,
        userId,
        exchange,
        asset,
        currency,
        timeframe,
        settings
      } = props;

      const trader = await findTrader({
        userId,
        robotId
      });
      if (trader) {
        if (trader.status === STATUS_STARTED || trader.status === STATUS_BUSY)
          return { taskId, status: STATUS_STARTED };
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId,
          userId
        }),
        eventType: TASKS_TRADER_START_EVENT,
        data: {
          taskId,
          robotId,
          userId,
          exchange,
          asset,
          currency,
          timeframe,
          settings
        }
      });
      return { taskId, status: STATUS_STARTING };
    } catch (error) {
      throw new VError(
        {
          name: "TraderRunnerError",
          cause: error,
          info: props
        },
        "Failed to start trader"
      );
    }
  }

  static async stop(context, props) {
    try {
      genErrorIfExist(validateStop(props));
      const { taskId } = props;
      const trader = await getTraderById(taskId);
      if (!trader) return { taskId, status: STATUS_STOPPED };
      if (trader.status === STATUS_STOPPED)
        return { taskId, status: STATUS_STOPPED };
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange: trader.exchange,
          asset: trader.asset,
          currency: trader.currency,
          timeframe: trader.timeframe,
          robotId: trader.robotId,
          userId: trader.userId
        }),
        eventType: TASKS_TRADER_STOP_EVENT,
        data: {
          taskId
        }
      });
      return { taskId, status: STATUS_STOPPING };
    } catch (error) {
      throw new VError(
        {
          name: "TraderRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop trader"
      );
    }
  }

  static async update(context, props) {
    try {
      genErrorIfExist(validateUpdate(props));
      const { taskId, settings } = props;
      const trader = await getTraderById(taskId);
      if (!trader)
        throw new VError(
          {
            name: "TraderNotFound"
          },
          "Failed to find trader"
        );
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange: trader.exchange,
          asset: trader.asset,
          currency: trader.currency,
          timeframe: trader.timeframe,
          robotId: trader.robotId,
          userId: trader.userId
        }),
        eventType: TASKS_TRADER_UPDATE_EVENT,
        data: {
          taskId,
          settings
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "TraderRunnerError",
          cause: error,
          info: props
        },
        "Failed to update trader"
      );
    }
  }
}

export default TraderRunner;
