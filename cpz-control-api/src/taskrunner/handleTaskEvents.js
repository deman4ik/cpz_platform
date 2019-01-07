import { VError } from "verror";
import {
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT,
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
  TRADER_SERVICE,
  IMPORTER_SERVICE
} from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_FINISHED
} from "cpzState";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import {
  findExWatchersByServiceId,
  findUserRobotsByServiceId
} from "cpzStorage";
import UserRobot from "./userrobot";
import RobotRunner from "./robotRunner";
import ExWatcher from "./exwatcher";

async function handleStarted(context, eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;

    if (
      eventType === TASKS_MARKETWATCHER_STARTED_EVENT.eventType ||
      eventType === TASKS_CANDLEBATCHER_STARTED_EVENT.eventType
    ) {
      switch (eventType) {
        case TASKS_MARKETWATCHER_STARTED_EVENT.eventType:
          serviceName = MARKETWATCHER_SERVICE;
          break;
        case TASKS_CANDLEBATCHER_STARTED_EVENT.eventType:
          serviceName = CANDLEBATCHER_SERVICE;
          break;
        default:
          return;
      }

      const exWatchers = await findExWatchersByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Status`] = STATUS_STARTED;
            await exWatcher.save();
            if (exWatcher.status === STATUS_STARTING) {
              const newState = exWatcher.getCurrentState();
              await ExWatcher.start(newState);
            }
          }
        })
      );
    }

    if (
      eventType === TASKS_EXWATCHER_STARTED_EVENT.eventType ||
      eventType === TASKS_ADVISER_STARTED_EVENT.eventType ||
      eventType === TASKS_TRADER_STARTED_EVENT.eventType
    ) {
      switch (eventType) {
        case TASKS_EXWATCHER_STARTED_EVENT.eventType:
          serviceName = CANDLEBATCHER_SERVICE;
          break;
        case TASKS_ADVISER_STARTED_EVENT.eventType:
          serviceName = ADVISER_SERVICE;
          break;
        case TASKS_TRADER_STARTED_EVENT.eventType:
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

async function handleFinished(context, eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;

    if (eventType === TASKS_IMPORTER_FINISHED_EVENT.eventType) {
      serviceName = IMPORTER_SERVICE;

      const exWatchers = await findExWatchersByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Status`] = STATUS_FINISHED;
            await exWatcher.save();

            const newState = exWatcher.getCurrentState();
            await ExWatcher.start(newState);
          }
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

    if (
      eventType === TASKS_MARKETWATCHER_STOPPED_EVENT.eventType ||
      eventType === TASKS_CANDLEBATCHER_STOPPED_EVENT.eventType
    ) {
      switch (eventType) {
        case TASKS_MARKETWATCHER_STOPPED_EVENT.eventType:
          serviceName = MARKETWATCHER_SERVICE;
          break;
        case TASKS_CANDLEBATCHER_STOPPED_EVENT.eventType:
          serviceName = CANDLEBATCHER_SERVICE;
          break;
        default:
          return;
      }

      const exWatchers = await findExWatchersByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Status`] = STATUS_STOPPED;
            await exWatcher.save();
          }
        })
      );
    }

    if (
      eventType === TASKS_EXWATCHER_STOPPED_EVENT.eventType ||
      eventType === TASKS_ADVISER_STOPPED_EVENT.eventType ||
      eventType === TASKS_TRADER_STOPPED_EVENT.eventType
    ) {
      switch (eventType) {
        case TASKS_EXWATCHER_STOPPED_EVENT.eventType:
          serviceName = CANDLEBATCHER_SERVICE;
          break;
        case TASKS_ADVISER_STOPPED_EVENT.eventType:
          serviceName = ADVISER_SERVICE;
          break;
        case TASKS_TRADER_STOPPED_EVENT.eventType:
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
      if (
        eventType === TASKS_MARKETWATCHER_UPDATED_EVENT.eventType ||
        eventType === TASKS_CANDLEBATCHER_UPDATED_EVENT.eventType
      ) {
        switch (eventType) {
          case TASKS_MARKETWATCHER_UPDATED_EVENT.eventType:
            serviceName = MARKETWATCHER_SERVICE;
            break;
          case TASKS_CANDLEBATCHER_UPDATED_EVENT.eventType:
            serviceName = CANDLEBATCHER_SERVICE;
            break;
          default:
            return;
        }

        const exWatchers = await findExWatchersByServiceId({
          taskId,
          serviceName
        });

        await Promise.all(
          exWatchers.map(async exWatcherState => {
            const exWatcher = new ExWatcher(exWatcherState);

            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          })
        );
      }

      if (
        eventType === TASKS_ADVISER_UPDATED_EVENT.eventType ||
        eventType === TASKS_TRADER_UPDATED_EVENT.eventType
      ) {
        switch (eventType) {
          case TASKS_ADVISER_UPDATED_EVENT.eventType:
            serviceName = ADVISER_SERVICE;
            break;
          case TASKS_TRADER_UPDATED_EVENT.eventType:
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
            userRobot[`${serviceName}Status`] = STATUS_ERROR;
            await userRobot.save();
          })
        );
      }
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

export { handleStarted, handleFinished, handleStopped, handleUpdated };
