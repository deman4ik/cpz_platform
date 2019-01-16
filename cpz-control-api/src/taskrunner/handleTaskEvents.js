import { VError } from "verror";
import {
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
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
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT,
  ERROR_CONTROL_EVENT,
  ERROR_TOPIC
} from "cpzEventTypes";
import {
  CONTROL_SERVICE,
  MARKETWATCHER_SERVICE,
  CANDLEBATCHER_SERVICE,
  ADVISER_SERVICE,
  TRADER_SERVICE,
  EXWATCHER_SERVICE,
  IMPORTER_SERVICE,
  BACKTESTER_SERVICE
} from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_PENDING,
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_FINISHED
} from "cpzState";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import {
  findExWatchersByServiceId,
  findExWatchersByImporterId,
  findUserRobotsByServiceId,
  findBacktestsByServiceId,
  getMarketwatcherById,
  deleteMarketwatcherState,
  getCandlebatcherById,
  deleteCandlebatcherState,
  getExWatcherById,
  deleteExWatcherState,
  getAdviserById,
  deleteAdviserState,
  getTraderById,
  deleteTraderState,
  getImporterById,
  deleteImporterState,
  getBacktesterById,
  deleteBacktesterState
} from "cpzStorage";
import Backtest from "./tasks/backtest";
import BacktestRunner from "./tasks/backtestRunner";
import UserRobot from "./tasks/userRobot";
import UserRobotRunner from "./tasks/userRobotRunner";
import ExWatcher from "./tasks/exwatcher";
import ExWatcherRunner from "./tasks/exwatcherRunner";

async function handleStarted(context, eventData) {
  try {
    context.log.info("handleStarted", eventData);
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
            if (exWatcher.status === STATUS_PENDING) {
              const newState = exWatcher.getCurrentState();
              await ExWatcherRunner.start(context, newState);
            }
          }
        })
      );
    }

    if (eventType === TASKS_IMPORTER_STARTED_EVENT.eventType) {
      const exWatchers = await findExWatchersByImporterId({
        taskId
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (exWatcher.importerHistoryId === taskId) {
            serviceName = "importerHistory";
          } else if (exWatcher.importerCurrentId === taskId) {
            serviceName = "importerCurrent";
          } else {
            context.log.error(
              `Importer ${taskId} not found in ExWatcher ${
                exWatcherState.taskId
              } state`
            );
          }
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Status`] = STATUS_STARTED;
            await exWatcher.save();
          }
        })
      );

      serviceName = IMPORTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Status`] = STATUS_STARTED;
            await backtest.save();

            const newState = backtest.getCurrentState();
            await ExWatcherRunner.start(context, newState);
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
          serviceName = EXWATCHER_SERVICE;
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
      context.log("handleStarted", taskId, serviceName);
      const userRobots = await findUserRobotsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        userRobots.map(async userRobotState => {
          context.log(userRobotState);
          const userRobot = new UserRobot(userRobotState);
          if (error) {
            userRobot.error = error;
            userRobot[`${serviceName}Status`] = STATUS_ERROR;
            await userRobot.save();
          } else {
            userRobot[`${serviceName}Status`] = STATUS_STARTED;
            await userRobot.save();
            if (userRobot.status === STATUS_PENDING) {
              const newState = userRobot.getCurrentState();
              await UserRobotRunner.start(context, newState);
            }
          }
          context.log(userRobot.getCurrentState());
        })
      );
    }

    if (eventType === TASKS_BACKTESTER_STARTED_EVENT.eventType) {
      serviceName = BACKTESTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Status`] = STATUS_STARTED;
            await backtest.save();
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
    context.log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function handleFinished(context, eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;

    if (eventType === TASKS_IMPORTER_FINISHED_EVENT.eventType) {
      const exWatchers = await findExWatchersByImporterId({
        taskId
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (exWatcher.importerHistoryId === taskId) {
            serviceName = "importerHistory";
          } else {
            serviceName = "importerCurrent";
          }
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Status`] = STATUS_FINISHED;
            await exWatcher.save();

            const newState = exWatcher.getCurrentState();
            await ExWatcherRunner.start(context, newState);
          }
        })
      );

      serviceName = IMPORTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Status`] = STATUS_FINISHED;
            await backtest.save();

            const newState = backtest.getCurrentState();
            await BacktestRunner.start(context, newState);
          }
        })
      );
    }

    if (eventType === TASKS_BACKTESTER_FINISHED_EVENT.eventType) {
      serviceName = BACKTESTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Status`] = STATUS_FINISHED;
            await backtest.save();
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
    context.log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function handleStopped(context, eventData) {
  try {
    const { eventType, taskId, error } = eventData;
    let serviceName;

    if (!error) await deleteState(taskId, eventType);
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

    if (eventType === TASKS_IMPORTER_STOPPED_EVENT.eventType) {
      const exWatchers = await findExWatchersByImporterId({
        taskId
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const exWatcher = new ExWatcher(exWatcherState);
          if (exWatcher.importerHistoryId === taskId) {
            serviceName = "importerHistory";
          } else {
            serviceName = "importerCurrent";
          }
          if (error) {
            exWatcher.error = error;
            exWatcher[`${serviceName}Status`] = STATUS_ERROR;
            await exWatcher.save();
          } else {
            exWatcher[`${serviceName}Id`] = null;
            exWatcher[`${serviceName}Status`] = STATUS_STOPPED;
            await exWatcher.save();
          }
        })
      );

      serviceName = IMPORTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Id`] = null;
            backtest[`${serviceName}Status`] = STATUS_STOPPED;
            await backtest.save();
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
          serviceName = EXWATCHER_SERVICE;
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
            userRobot[`${serviceName}Id`] = null;
            userRobot[`${serviceName}Status`] = STATUS_STOPPED;
            await userRobot.save();
          }
        })
      );
    }

    if (eventType === TASKS_BACKTESTER_STOPPED_EVENT.eventType) {
      serviceName = BACKTESTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const backtest = new Backtest(backtestState);
          if (error) {
            backtest.error = error;
            backtest[`${serviceName}Status`] = STATUS_ERROR;
            await backtest.save();
          } else {
            backtest[`${serviceName}Id`] = null;
            backtest[`${serviceName}Status`] = STATUS_STOPPED;
            await backtest.save();
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
    context.log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function handleUpdated(context, eventData) {
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
    context.log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CONTROL_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_CONTROL_EVENT,
      data: {
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

async function deleteState(taskId, eventType) {
  try {
    if (eventType === TASKS_MARKETWATCHER_STOPPED_EVENT.eventType) {
      const marketwatcher = await getMarketwatcherById(taskId);
      if (marketwatcher) await deleteMarketwatcherState(marketwatcher);
    } else if (eventType === TASKS_CANDLEBATCHER_STOPPED_EVENT.eventType) {
      const candlebatcher = await getCandlebatcherById(taskId);
      if (candlebatcher) await deleteCandlebatcherState(candlebatcher);
    } else if (eventType === TASKS_EXWATCHER_STOPPED_EVENT.eventType) {
      const exWatcher = await getExWatcherById(taskId);
      if (exWatcher) await deleteExWatcherState(exWatcher);
    } else if (eventType === TASKS_ADVISER_STOPPED_EVENT.eventType) {
      const adviser = await getAdviserById(taskId);
      if (adviser) await deleteAdviserState(adviser);
    } else if (eventType === TASKS_TRADER_STOPPED_EVENT.eventType) {
      const trader = await getTraderById(taskId);
      if (trader) await deleteTraderState(trader);
    } else if (eventType === TASKS_IMPORTER_STOPPED_EVENT.eventType) {
      const importer = await getImporterById(taskId);
      if (importer) await deleteImporterState(importer);
    } else if (eventType === TASKS_BACKTESTER_STOPPED_EVENT.eventType) {
      const backtester = await getBacktesterById(taskId);
      if (backtester) await deleteBacktesterState(backtester);
    }
  } catch (error) {
    throw new VError(
      {
        name: "DeleteStateError",
        cause: error,
        info: {
          taskId,
          eventType
        }
      },
      "Failed to delete state after '%s' event",
      eventType
    );
  }
}
export { handleStarted, handleFinished, handleStopped, handleUpdated };
