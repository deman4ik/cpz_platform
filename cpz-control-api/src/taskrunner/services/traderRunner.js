import ServiceError from "cpz/error";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PAUSED,
  STATUS_PAUSING,
  STATUS_RESUMING,
  createTraderTaskSubject
} from "cpz/config/state";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_PAUSE_EVENT,
  TASKS_TRADER_RESUME_EVENT
} from "cpz/events/types/tasks/trader";
import { getTraderById } from "cpz/tableStorage-client/control/traders";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

class TraderRunner extends BaseRunner {
  static async start(props) {
    try {
      ServiceValidator.check(TASKS_TRADER_START_EVENT, { ...props });
      const {
        taskId,
        robotId,
        userId,
        exchange,
        asset,
        currency,
        timeframe,
        settings
      } = props;

      const trader = await getTraderById(taskId);
      if (trader) {
        if (trader.status === STATUS_STARTED)
          return { taskId, status: STATUS_STARTED };
      }

      const event = {
        eventType: TASKS_TRADER_START_EVENT,
        eventData: {
          subject: createTraderTaskSubject({
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
            exchange,
            asset,
            currency,
            timeframe,
            settings
          }
        }
      };

      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to start trader"
      );
    }
  }

  static async stop(props) {
    try {
      ServiceValidator.check(TASKS_TRADER_STOP_EVENT, props);
      const { taskId } = props;
      const trader = await getTraderById(taskId);
      if (!trader) return { taskId, status: STATUS_STOPPED };
      if (trader.status === STATUS_STOPPED)
        return { taskId, status: STATUS_STOPPED };
      const event = {
        eventType: TASKS_TRADER_STOP_EVENT,
        eventData: {
          subject: createTraderTaskSubject({
            exchange: trader.exchange,
            asset: trader.asset,
            currency: trader.currency,
            timeframe: trader.timeframe,
            robotId: trader.robotId,
            userId: trader.userId
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
          name: ServiceError.types.TRADER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to stop trader"
      );
    }
  }

  static async update(props) {
    try {
      ServiceValidator.check(TASKS_TRADER_UPDATE_EVENT, props);
      const { taskId, settings } = props;
      const trader = await getTraderById(taskId);
      if (!trader)
        throw new ServiceError(
          {
            name: ServiceError.types.TRADER_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to find trader"
        );

      const event = {
        eventType: TASKS_TRADER_UPDATE_EVENT,
        eventData: {
          subject: createTraderTaskSubject({
            exchange: trader.exchange,
            asset: trader.asset,
            currency: trader.currency,
            timeframe: trader.timeframe,
            robotId: trader.robotId,
            userId: trader.userId
          }),
          data: {
            taskId,
            settings
          }
        }
      };
      return { event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to update trader"
      );
    }
  }

  static async pause(props) {
    try {
      ServiceValidator.check(TASKS_TRADER_PAUSE_EVENT, props);
      const { taskId } = props;
      const trader = await getTraderById(taskId);
      if (!trader) return { taskId, status: STATUS_STOPPED };
      if (
        [STATUS_STOPPED, STATUS_STOPPING, STATUS_PAUSED].includes(trader.status)
      )
        return { taskId, status: trader.status };
      const event = {
        eventType: TASKS_TRADER_PAUSE_EVENT,
        eventData: {
          subject: createTraderTaskSubject({
            exchange: trader.exchange,
            asset: trader.asset,
            currency: trader.currency,
            timeframe: trader.timeframe,
            robotId: trader.robotId,
            userId: trader.userId
          }),
          data: {
            taskId
          }
        }
      };

      return { taskId, status: STATUS_PAUSING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to pause trader"
      );
    }
  }

  static async resume(props) {
    try {
      ServiceValidator.check(TASKS_TRADER_RESUME_EVENT, props);
      const { taskId } = props;
      const trader = await getTraderById(taskId);
      if (!trader) return { taskId, status: STATUS_STOPPED };
      if (trader.status === STATUS_STARTED)
        return { taskId, status: trader.status };
      const event = {
        eventType: TASKS_TRADER_RESUME_EVENT,
        eventData: {
          subject: createTraderTaskSubject({
            exchange: trader.exchange,
            asset: trader.asset,
            currency: trader.currency,
            timeframe: trader.timeframe,
            robotId: trader.robotId,
            userId: trader.userId
          }),
          data: {
            taskId
          }
        }
      };

      return { taskId, status: STATUS_RESUMING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to resume trader"
      );
    }
  }
}

export default TraderRunner;
