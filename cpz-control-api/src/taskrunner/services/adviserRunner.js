import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_BUSY,
  createAdviserTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE, ADVISER_SERVICE } from "cpzServices";
import {
  findAdviser,
  getAdviserById,
  findOtherActiveUserRobotsByServiceId
} from "cpzStorage";
import BaseRunner from "../baseRunner";

const validateStart = createValidator(TASKS_ADVISER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_ADVISER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(TASKS_ADVISER_UPDATE_EVENT.dataSchema);
class AdviserRunner extends BaseRunner {
  static async start(context, props) {
    try {
      // TODO: resume в отдельный метод
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();

      genErrorIfExist(validateStart({ ...props, taskId }));
      const { robotId, exchange, asset, currency, timeframe, settings } = props;

      const adviser = resume
        ? await getAdviserById(taskId)
        : await findAdviser({
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
        service: CONTROL_SERVICE,
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
      genErrorIfExist(validateStop(props));
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
        service: CONTROL_SERVICE,
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
      genErrorIfExist(validateUpdate(props));
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
        service: CONTROL_SERVICE,
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
