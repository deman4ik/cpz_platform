import ServiceError from "cpz/error";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_FINISHED,
  createBacktesterTaskSubject
} from "cpz/config/state";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpz/events/types/tasks/backtester";
import { getBacktesterById } from "cpz/tableStorage-client/backtest/backtesters";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

class BacktesterRunner extends BaseRunner {
  static async start(props) {
    try {
      const taskId = props.taskId || uuid();

      ServiceValidator.check(TASKS_BACKTESTER_START_EVENT, {
        ...props,
        taskId
      });
      const {
        robotId,
        userId,
        strategyName,
        exchange,
        asset,
        currency,
        timeframe,
        dateFrom,
        dateTo,
        settings,
        adviserSettings,
        traderSettings
      } = props;

      const backtester = await getBacktesterById(taskId);
      if (backtester && backtester.status === STATUS_STARTED)
        throw new ServiceError(
          {
            name: ServiceError.types.BACKTESTER_ALREADY_STARTED,
            info: { taskId }
          },
          "Backtester already started"
        );

      const event = {
        eventType: TASKS_BACKTESTER_START_EVENT,
        eventData: {
          subject: createBacktesterTaskSubject({
            exchange,
            asset,
            currency,
            timeframe,
            robotId,
            userId
          }),
          data: {
            taskId,
            robotId,
            userId,
            strategyName,
            exchange,
            asset,
            currency,
            timeframe,
            settings,
            dateFrom,
            dateTo,
            adviserSettings,
            traderSettings
          }
        }
      };

      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.BACKTESTER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to start backtest"
      );
    }
  }

  static async stop(props) {
    try {
      ServiceValidator.check(TASKS_BACKTESTER_STOP_EVENT, props);
      const { taskId } = props;
      const backtester = await getBacktesterById(taskId);

      if (!backtester)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (
        backtester.status === STATUS_STOPPED ||
        backtester.status === STATUS_FINISHED
      )
        return { taskId, status: backtester.status };

      const event = {
        eventType: TASKS_BACKTESTER_STOP_EVENT,
        eventData: {
          subject: createBacktesterTaskSubject({
            exchange: backtester.exchange,
            asset: backtester.asset,
            currency: backtester.currency,
            timeframe: backtester.timeframe,
            robotId: backtester.robotId,
            userId: backtester.userId
          }),
          data: {
            taskId
          }
        }
      };

      return { taskId, status: STATUS_STOPPING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.BACKTESTER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to stop backtest"
      );
    }
  }
}

export default BacktesterRunner;
