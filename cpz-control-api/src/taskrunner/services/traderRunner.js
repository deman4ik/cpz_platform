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
  STATUS_STOPPED,
  STATUS_BUSY,
  createTraderTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { isTraderExists, getTraderById } from "cpzStorage";
import BaseServiceRunner from "./baseServiceRunner";

class TraderRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();
      const validate = createValidator(TASKS_TRADER_START_EVENT.dataSchema);
      genErrorIfExist(validate({ ...props, taskId }));
      const {
        mode,
        debug,
        robotId,
        userId,
        adviserId,
        exchange,
        asset,
        currency,
        timeframe,
        slippageStep,
        deviation,
        volume
      } = props;
      if (resume) {
        const trader = await getTraderById(taskId);
        if (trader.status === STATUS_STARTED || trader.status === STATUS_BUSY)
          throw new VError(
            {
              name: "TraderAlreadyStarted",
              info: {
                taskId
              }
            },
            "Trader already started"
          );
      } else {
        const exists = await isTraderExists({
          mode,
          userId,
          robotId
        });

        if (exists)
          throw new VError(
            {
              name: "TraderAlreadyExists",
              info: {
                taskId
              }
            },
            "Trader already exists"
          );
      }
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId,
          mode
        }),
        eventType: TASKS_TRADER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          robotId,
          userId,
          adviserId,
          exchange,
          asset,
          currency,
          timeframe,
          slippageStep,
          deviation,
          volume
        }
      });
      return { taskId };
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

  static async stop(props) {
    try {
      const validate = createValidator(TASKS_TRADER_STOP_EVENT.dataSchema);

      genErrorIfExist(validate(props));
      const { taskId } = props;
      const trader = await getTraderById(taskId);
      if (trader.status === STATUS_STOPPED)
        throw new VError(
          {
            name: "TraderAlreadyStopped",
            info: {
              taskId
            }
          },
          "Trader already stopped"
        );
      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange: trader.exchange,
          asset: trader.asset,
          currency: trader.currency,
          timeframe: trader.timeframe,
          robotId: trader.robotId,
          mode: trader.mode
        }),
        eventType: TASKS_TRADER_STOP_EVENT,
        data: {
          taskId
        }
      });
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

  static async update(props) {
    try {
      const validate = createValidator(TASKS_TRADER_UPDATE_EVENT.dataSchema);
      genErrorIfExist(validate(props));
      const { taskId, debug, slippageStep, deviation, volume } = props;
      const trader = await getTraderById(taskId);

      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createTraderTaskSubject({
          exchange: trader.exchange,
          asset: trader.asset,
          currency: trader.currency,
          timeframe: trader.timeframe,
          robotId: trader.robotId,
          mode: trader.mode
        }),
        eventType: TASKS_TRADER_UPDATE_EVENT,
        data: {
          taskId,
          debug,
          slippageStep,
          deviation,
          volume
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
