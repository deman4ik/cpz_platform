import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createBacktesterTaskSubject } from "cpzState";
import { getBacktesterById } from "cpzStorage";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import BaseServiceRunner from "./baseServiceRunner";

class BacktesterRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      const taskId = uuid();
      const validate = createValidator(TASKS_BACKTESTER_START_EVENT.dataSchema);
      genErrorIfExist(validate({ ...props, taskId, adviserId: taskId }));
      const {
        debug,
        strategyName,
        userId,
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        settings,
        slippageStep,
        deviation,
        volume,
        requiredHistoryCache,
        requiredHistoryMaxBars,
        dateFrom,
        dateTo
      } = props;

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createBacktesterTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId
        }),
        eventType: TASKS_BACKTESTER_START_EVENT,
        data: {
          taskId,
          adviserId: taskId,
          debug,
          strategyName,
          userId,
          robotId,
          exchange,
          asset,
          currency,
          timeframe,
          settings,
          slippageStep,
          deviation,
          volume,
          requiredHistoryCache,
          requiredHistoryMaxBars,
          dateFrom,
          dateTo
        }
      });
      return { taskId };
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

  static async stop(props) {
    try {
      const validate = createValidator(TASKS_BACKTESTER_STOP_EVENT.dataSchema);

      genErrorIfExist(validate(props));
      const { taskId } = props;
      const backtester = await getBacktesterById({
        taskId
      });

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createBacktesterTaskSubject({
          exchange: backtester.exchange,
          asset: backtester.asset,
          currency: backtester.currency,
          timeframe: backtester.timeframe,
          robotId: backtester.robotId
        }),
        eventType: TASKS_BACKTESTER_STOP_EVENT,
        data: {
          taskId
        }
      });
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
