import ServiceError from "cpz/error";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PAUSED,
  STATUS_PAUSING,
  STATUS_RESUMING
} from "cpz/config/state";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_PAUSE_EVENT,
  TASKS_ADVISER_RESUME_EVENT
} from "cpz/events/types/tasks/adviser";
import { getAdviserById } from "cpz/tableStorage-client/control/advisers";
import { findOtherActiveUserRobotsByServiceId } from "cpz/tableStorage-client/control/userRobots";
import ServiceValidator from "cpz/validator";
import { ADVISER_SERVICE } from "cpz/config/services";
import BaseRunner from "../baseRunner";

class AdviserRunner extends BaseRunner {
  static async start(props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_START_EVENT, { ...props });
      const {
        taskId,
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        settings
      } = props;

      const adviser = await getAdviserById(taskId);

      if (adviser) {
        if (adviser.status === STATUS_STARTED)
          return {
            taskId,
            status: STATUS_STARTED
          };
      }

      const event = {
        eventType: TASKS_ADVISER_START_EVENT,
        eventData: {
          subject: taskId,
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
        }
      };
      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to start adviser"
      );
    }
  }

  static async stop(props) {
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

      const event = {
        eventType: TASKS_ADVISER_STOP_EVENT,
        eventData: {
          subject: taskId,
          data: {
            taskId
          }
        }
      };
      return { taskId, status: STATUS_STOPPING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to stop adviser"
      );
    }
  }

  static async update(props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_UPDATE_EVENT, props);
      const { taskId, settings } = props;
      const adviser = await getAdviserById(taskId);
      if (!adviser)
        throw new ServiceError(
          {
            name: ServiceError.types.ADVISER_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to find adviser"
        );

      const event = {
        eventType: TASKS_ADVISER_UPDATE_EVENT,
        eventData: {
          subject: taskId,
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
          name: ServiceError.types.ADVISER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to update adviser"
      );
    }
  }

  static async pause(props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_PAUSE_EVENT, props);
      const { taskId } = props;
      const adviser = await getAdviserById(taskId);
      if (!adviser)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if ([STATUS_PAUSED, STATUS_STOPPED].includes(adviser.status))
        return { taskId, status: adviser.status };
      const event = {
        eventType: TASKS_ADVISER_PAUSE_EVENT,
        eventData: {
          subject: taskId,
          data: {
            taskId
          }
        }
      };
      return { taskId, status: STATUS_PAUSING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to pause adviser"
      );
    }
  }

  static async resume(props) {
    try {
      ServiceValidator.check(TASKS_ADVISER_RESUME_EVENT, props);
      const { taskId } = props;
      const adviser = await getAdviserById(taskId);
      if (!adviser)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (adviser.status === STATUS_STARTED)
        return { taskId, status: STATUS_STARTED };
      const event = {
        eventType: TASKS_ADVISER_RESUME_EVENT,
        eventData: {
          subject: taskId,
          data: {
            taskId
          }
        }
      };
      return { taskId, status: STATUS_RESUMING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to resume adviser"
      );
    }
  }
}

export default AdviserRunner;
