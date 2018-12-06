import { VError } from "verror";
import {
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_UPDATED_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATED_EVENT,
  ERROR_CONTROL_EVENT,
  ERROR_TOPIC
} from "cpzEventTypes";
import {
  CONTROL_SERVICE,
  MARKETWATCHER_SERVICE,
  CANDLEBATCHER_SERVICE,
  ADVISER_SERVICE,
  TRADER_SERVICE
} from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_ERROR
} from "cpzState";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import { findUserRobotsByServiceId } from "cpzStorage";
import UserRobot from "./userRobot";
import RobotRunner from "./robotRunner";

async function handleStarted(context, eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;
    switch (eventType) {
      case TASKS_MARKETWATCHER_STARTED_EVENT:
        serviceName = MARKETWATCHER_SERVICE;
        break;
      case TASKS_CANDLEBATCHER_STARTED_EVENT:
        serviceName = CANDLEBATCHER_SERVICE;
        break;
      case TASKS_ADVISER_STARTED_EVENT:
        serviceName = ADVISER_SERVICE;
        break;
      case TASKS_TRADER_STARTED_EVENT:
        serviceName = TRADER_SERVICE;
        break;
      default:
        return;
    }
    const userRobots = await findUserRobotsByServiceId({
      taskId,
      serviceName
    });

    await Promise.all(
      userRobots.map(async userRobotState => {
        const userRobot = new UserRobot(userRobotState);
        if (error) {
          userRobot.error = error;
          userRobot[`${serviceName}Status`] = STATUS_ERROR;
          await userRobot.save();
        } else {
          userRobot[`${serviceName}Status`] = STATUS_STARTED;
          await userRobot.save();
          if (userRobot.status === STATUS_STARTING) {
            const newState = userRobot.getCurrentState();
            await RobotRunner.start(newState);
          }
        }
      })
    );
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TaskRunnerError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to handle started events"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: errorOutput
      }
    });
  }
}

async function handleStopped(eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;
    switch (eventType) {
      case TASKS_MARKETWATCHER_STOPPED_EVENT:
        serviceName = MARKETWATCHER_SERVICE;
        break;
      case TASKS_CANDLEBATCHER_STOPPED_EVENT:
        serviceName = CANDLEBATCHER_SERVICE;
        break;
      case TASKS_ADVISER_STOPPED_EVENT:
        serviceName = ADVISER_SERVICE;
        break;
      case TASKS_TRADER_STOPPED_EVENT:
        serviceName = TRADER_SERVICE;
        break;
      default:
        return;
    }
    const userRobots = await findUserRobotsByServiceId({
      taskId,
      serviceName
    });

    await Promise.all(
      userRobots.map(async userRobotState => {
        const userRobot = new UserRobot(userRobotState);
        if (error) {
          userRobot.error = error;
          userRobot[`${serviceName}Status`] = STATUS_ERROR;
          await userRobot.save();
        } else {
          userRobot[`${serviceName}Status`] = STATUS_STOPPED;
          await userRobot.save();
        }
      })
    );
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TaskRunnerError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to handle stopped events"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: errorOutput
      }
    });
  }
}

async function handleUpdated(eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    if (error) {
      let serviceName;
      switch (eventType) {
        case TASKS_MARKETWATCHER_UPDATED_EVENT:
          serviceName = MARKETWATCHER_SERVICE;
          break;
        case TASKS_CANDLEBATCHER_UPDATED_EVENT:
          serviceName = CANDLEBATCHER_SERVICE;
          break;
        case TASKS_ADVISER_UPDATED_EVENT:
          serviceName = ADVISER_SERVICE;
          break;
        case TASKS_TRADER_UPDATED_EVENT:
          serviceName = TRADER_SERVICE;
          break;
        default:
          return;
      }
      const userRobots = await findUserRobotsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        userRobots.map(async userRobotState => {
          const userRobot = new UserRobot(userRobotState);
          userRobot.error = error;
          await userRobot.save();
        })
      );
    }
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TaskRunnerError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to handle updated events"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: errorOutput
      }
    });
  }
}

export { handleStarted, handleStopped, handleUpdated };
