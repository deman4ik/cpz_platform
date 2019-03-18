import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_FINISHED,
  createBacktesterTaskSubject
} from "cpz/config/state";
import { getBacktesterById } from "cpz/tableStorage/backtesters";
import publishEvents from "cpz/eventgrid";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

import config from "../../config";

const {
  serviceName,
  events: {
    types: { TASKS_BACKTESTER_START_EVENT, TASKS_BACKTESTER_STOP_EVENT },
    topics: { TASKS_TOPIC }
  }
} = config;

class BacktesterRunner extends BaseRunner {
  static async start(context, props) {
    try {
      const taskId = props.taskId || uuid();

      ServiceValidator.check(TASKS_BACKTESTER_START_EVENT, { ...props, taskId });
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

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createBacktesterTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId,
          userId
        }),
        eventType: TASKS_BACKTESTER_START_EVENT,
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
      });
      return { taskId, status: STATUS_STARTING };
    } catch (error) {
      throw new VError(
        {
          name: "BacktesterRunnerError",
          cause: error,
          info: props
        },
        "Failed to start backtest"
      );
    }
  }

  static async stop(context, props) {
    try {
      ServiceValidator.check(TASKS_BACKTESTER_STOP_EVENT, props);
      const { taskId } = props;
      const backtester = await getBacktesterById({
        taskId
      });

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
      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createBacktesterTaskSubject({
          exchange: backtester.exchange,
          asset: backtester.asset,
          currency: backtester.currency,
          timeframe: backtester.timeframe,
          robotId: backtester.robotId,
          userId: backtester.userId
        }),
        eventType: TASKS_BACKTESTER_STOP_EVENT,
        data: {
          taskId
        }
      });
      return { taskId, status: STATUS_STOPPING };
    } catch (error) {
      throw new VError(
        {
          name: "BacktesterRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop backtest"
      );
    }
  }
}

export default BacktesterRunner;
