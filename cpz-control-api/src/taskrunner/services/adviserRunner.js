import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_BUSY,
  createAdviserTaskSubject
} from "cpz/config/state";
import publishEvents from "cpz/eventgrid";
import { findAdviser, getAdviserById } from "cpz/tableStorage/advisers";
import { findOtherActiveUserRobotsByServiceId } from "cpz/tableStorage/userRobots";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";
import config from "../../config";

const {
  serviceName,
  services: { ADVISER_SERVICE },
  events: {
    types: {
      TASKS_ADVISER_START_EVENT,
      TASKS_ADVISER_STOP_EVENT,
      TASKS_ADVISER_UPDATE_EVENT
    },
    topics: { TASKS_TOPIC }
  }
} = config;

class AdviserRunner extends BaseRunner {
  static async start(context, props) {
    try {
      const taskId = uuid();
      ServiceValidator.check(TASKS_ADVISER_START_EVENT, { ...props, taskId });
      const {
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        settings
      } = props;

      const adviser = await findAdviser({
        robotId
      });

      if (adviser) {
        if (adviser.status === STATUS_STARTED || adviser.status === STATUS_BUSY)
          return {
            taskId,
            status: STATUS_STARTED
          };
      }

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createAdviserTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId
        }),
        eventType: TASKS_ADVISER_START_EVENT,
        data: {
          taskId,
          robotId,
          exchange,
          asset,
          currency,
          timeframe,
          strategyName,
          settings
        }
      });
      return { taskId, status: STATUS_STARTING };
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to start adviser"
      );
    }
  }

  static async stop(context, props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_STOP_EVENT, props);
      const { taskId, userRobotId } = props;
      const adviser = await getAdviserById(taskId);
      if (!adviser)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (adviser.status === STATUS_STOPPED)
        return { taskId, status: STATUS_STOPPED };

      const userRobots = findOtherActiveUserRobotsByServiceId({
        userRobotId,
        taskId,
        serviceName: ADVISER_SERVICE
      });

      if (userRobots.length > 0) {
        return { taskId, status: adviser.status };
      }
      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createAdviserTaskSubject({
          exchange: adviser.exchange,
          asset: adviser.asset,
          currency: adviser.currency,
          timeframe: adviser.timeframe,
          robotId: adviser.robotId
        }),
        eventType: TASKS_ADVISER_STOP_EVENT,
        data: {
          taskId
        }
      });
      return { taskId, status: STATUS_STOPPING };
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop adviser"
      );
    }
  }

  static async update(context, props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_UPDATE_EVENT, props);
      const { taskId, settings } = props;
      const adviser = await getAdviserById(taskId);
      if (!adviser)
        throw new VError(
          {
            name: "AdviserNotFound"
          },
          "Failed to find adviser"
        );

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createAdviserTaskSubject({
          exchange: adviser.exchange,
          asset: adviser.asset,
          currency: adviser.currency,
          timeframe: adviser.timeframe,
          robotId: adviser.robotId
        }),
        eventType: TASKS_ADVISER_UPDATE_EVENT,
        data: {
          taskId,
          settings
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to update adviser"
      );
    }
  }
}

export default AdviserRunner;
