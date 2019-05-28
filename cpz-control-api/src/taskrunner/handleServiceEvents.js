import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  findExWatchersByServiceId,
  findExWatchersByImporterId,
  getExWatcherById,
  deleteExWatcherState
} from "cpz/tableStorage-client/control/exwatchers";
import { findUserRobotsByServiceId } from "cpz/tableStorage-client/control/userRobots";
import { findBacktestsByServiceId } from "cpz/tableStorage-client/control/backtests";
import {
  getImporterById,
  deleteImporterState
} from "cpz/tableStorage-client/control/importers";
import {
  getBacktesterById,
  deleteBacktesterState
} from "cpz/tableStorage-client/backtest/backtesters";
import {
  getMarketwatcherById,
  deleteMarketwatcherState
} from "cpz/tableStorage-client/control/marketwatchers";
import {
  getCandlebatcherById,
  deleteCandlebatcherState
} from "cpz/tableStorage-client/control/candlebatchers";
import {
  getAdviserById,
  deleteAdviserState
} from "cpz/tableStorage-client/control/advisers";
import {
  getTraderById,
  deleteTraderState
} from "cpz/tableStorage-client/control/traders";
import { deleteCandlebatcherActions } from "cpz/tableStorage-client/control/candlebatcherActions";
import { deleteAdviserActions } from "cpz/tableStorage-client/control/adviserActions";
import { deleteTraderActions } from "cpz/tableStorage-client/control/traderActions";
import EventHub from "cpz/eventhub-client";
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
  TASKS_BACKTESTER_FINISHED_EVENT
} from "cpz/events/types/tasks";
import {
  ERROR_ADVISER_ERROR_EVENT,
  ERROR_BACKTESTER_ERROR_EVENT,
  ERROR_CANDLEBATCHER_ERROR_EVENT,
  ERROR_EXWATCHER_ERROR_EVENT,
  ERROR_IMPORTER_ERROR_EVENT,
  ERROR_MARKETWATCHER_ERROR_EVENT,
  ERROR_TRADER_ERROR_EVENT
} from "cpz/events/types/error";
import {
  MARKETWATCHER_SERVICE,
  CANDLEBATCHER_SERVICE,
  ADVISER_SERVICE,
  TRADER_SERVICE,
  EXWATCHER_SERVICE,
  IMPORTER_SERVICE,
  BACKTESTER_SERVICE,
  BACKTEST_SERVICE,
  USERROBOT_SERVICE
} from "cpz/config/services";

async function handleServiceEvent(event) {
  try {
    const {
      eventType,
      data: { taskId }
    } = event;
    if (!taskId) return;
    let serviceName;
    if (
      eventType === TASKS_MARKETWATCHER_STARTED_EVENT ||
      eventType === TASKS_MARKETWATCHER_STOPPED_EVENT ||
      eventType === TASKS_MARKETWATCHER_UPDATED_EVENT ||
      eventType === ERROR_MARKETWATCHER_ERROR_EVENT ||
      eventType === TASKS_CANDLEBATCHER_STARTED_EVENT ||
      eventType === TASKS_CANDLEBATCHER_STOPPED_EVENT ||
      eventType === TASKS_CANDLEBATCHER_UPDATED_EVENT ||
      eventType === ERROR_CANDLEBATCHER_ERROR_EVENT
    ) {
      switch (eventType) {
        case TASKS_MARKETWATCHER_STARTED_EVENT:
        case TASKS_MARKETWATCHER_STOPPED_EVENT:
        case TASKS_MARKETWATCHER_UPDATED_EVENT:
        case ERROR_MARKETWATCHER_ERROR_EVENT:
          serviceName = MARKETWATCHER_SERVICE;
          break;
        case TASKS_CANDLEBATCHER_STARTED_EVENT:
        case TASKS_CANDLEBATCHER_STOPPED_EVENT:
        case TASKS_CANDLEBATCHER_UPDATED_EVENT:
        case ERROR_CANDLEBATCHER_ERROR_EVENT:
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
          const message = {
            taskId: exWatcherState.taskId,
            type: "event",
            service: EXWATCHER_SERVICE,
            data: event
          };
          try {
            await EventHub.send(exWatcherState.taskId, message);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
                info: {
                  message
                }
              },
              "Failed to send task runner action."
            );
            Log.exception(error);
          }
        })
      );
    } else if (
      eventType === TASKS_IMPORTER_STARTED_EVENT ||
      eventType === TASKS_IMPORTER_FINISHED_EVENT ||
      eventType === TASKS_IMPORTER_STOPPED_EVENT ||
      eventType === ERROR_IMPORTER_ERROR_EVENT
    ) {
      serviceName = IMPORTER_SERVICE;

      const exWatchers = await findExWatchersByImporterId({
        taskId
      });

      await Promise.all(
        exWatchers.map(async exWatcherState => {
          const message = {
            taskId: exWatcherState.taskId,
            type: "event",
            service: EXWATCHER_SERVICE,
            data: event
          };
          try {
            await EventHub.send(exWatcherState.taskId, message);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
                info: {
                  message
                }
              },
              "Failed to send task runner action."
            );
            Log.exception(error);
          }
        })
      );

      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const message = {
            taskId: backtestState.taskId,
            type: "event",
            service: BACKTEST_SERVICE,
            data: event
          };
          try {
            await EventHub.send(backtestState.taskId, message);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
                info: {
                  message
                }
              },
              "Failed to send task runner action."
            );
            Log.exception(error);
          }
        })
      );
    } else if (
      eventType === TASKS_EXWATCHER_STARTED_EVENT ||
      eventType === TASKS_EXWATCHER_STOPPED_EVENT ||
      eventType === ERROR_EXWATCHER_ERROR_EVENT ||
      eventType === TASKS_ADVISER_STARTED_EVENT ||
      eventType === TASKS_ADVISER_STOPPED_EVENT ||
      eventType === TASKS_ADVISER_UPDATED_EVENT ||
      eventType === ERROR_ADVISER_ERROR_EVENT ||
      eventType === TASKS_TRADER_STARTED_EVENT ||
      eventType === TASKS_TRADER_STOPPED_EVENT ||
      eventType === TASKS_TRADER_UPDATED_EVENT ||
      eventType === ERROR_TRADER_ERROR_EVENT
    ) {
      switch (eventType) {
        case TASKS_EXWATCHER_STARTED_EVENT:
        case TASKS_EXWATCHER_STOPPED_EVENT:
        case ERROR_EXWATCHER_ERROR_EVENT:
          serviceName = EXWATCHER_SERVICE;
          break;
        case TASKS_ADVISER_STARTED_EVENT:
        case TASKS_ADVISER_STOPPED_EVENT:
        case TASKS_ADVISER_UPDATED_EVENT:
        case ERROR_ADVISER_ERROR_EVENT:
          serviceName = ADVISER_SERVICE;
          break;
        case TASKS_TRADER_STARTED_EVENT:
        case TASKS_TRADER_STOPPED_EVENT:
        case ERROR_TRADER_ERROR_EVENT:
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
          const message = {
            taskId: userRobotState.id,
            type: "event",
            service: USERROBOT_SERVICE,
            data: event
          };
          try {
            await EventHub.send(userRobotState.id, message);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
                info: {
                  message
                }
              },
              "Failed to send task runner action."
            );
            Log.exception(error);
          }
        })
      );
    } else if (
      eventType === TASKS_BACKTESTER_STARTED_EVENT ||
      eventType === TASKS_BACKTESTER_FINISHED_EVENT ||
      eventType === TASKS_BACKTESTER_STOPPED_EVENT ||
      eventType === TASKS_TRADER_UPDATED_EVENT ||
      eventType === ERROR_BACKTESTER_ERROR_EVENT
    ) {
      serviceName = BACKTESTER_SERVICE;
      const backtests = await findBacktestsByServiceId({
        taskId,
        serviceName
      });

      await Promise.all(
        backtests.map(async backtestState => {
          const message = {
            taskId: backtestState.taskId,
            type: "event",
            service: BACKTEST_SERVICE,
            data: event
          };
          try {
            await EventHub.send(backtestState.taskId, message);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
                info: {
                  message
                }
              },
              "Failed to send task runner action."
            );
            Log.exception(error);
          }
        })
      );
    }

    if (eventType.includes(".Stopped")) {
      await deleteState(taskId, eventType);
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONTROL_HANDLE_EVENT_ERROR,
        info: { event }
      },
      "Failed to handle event"
    );
  }
}

async function deleteState(taskId, eventType) {
  try {
    if (eventType === TASKS_MARKETWATCHER_STOPPED_EVENT) {
      const marketwatcher = await getMarketwatcherById(taskId);
      if (marketwatcher) await deleteMarketwatcherState(marketwatcher);
    } else if (eventType === TASKS_CANDLEBATCHER_STOPPED_EVENT) {
      const candlebatcher = await getCandlebatcherById(taskId);
      if (candlebatcher) {
        await deleteCandlebatcherState(candlebatcher);
        await deleteCandlebatcherActions(taskId);
      }
    } else if (eventType === TASKS_EXWATCHER_STOPPED_EVENT) {
      const exWatcher = await getExWatcherById(taskId);
      if (exWatcher) await deleteExWatcherState(exWatcher);
    } else if (eventType === TASKS_ADVISER_STOPPED_EVENT) {
      const adviser = await getAdviserById(taskId);
      if (adviser) {
        await deleteAdviserState(adviser);
        await deleteAdviserActions(taskId);
      }
    } else if (eventType === TASKS_TRADER_STOPPED_EVENT) {
      const trader = await getTraderById(taskId);
      if (trader) {
        await deleteTraderState(trader);
        await deleteTraderActions(taskId);
      }
    } else if (eventType === TASKS_IMPORTER_STOPPED_EVENT) {
      const importer = await getImporterById(taskId);
      if (importer) await deleteImporterState(importer);
    } else if (eventType === TASKS_BACKTESTER_STOPPED_EVENT) {
      const backtester = await getBacktesterById(taskId);
      if (backtester) await deleteBacktesterState(backtester);
    }
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONTROL_DELETE_STATE_ERROR,
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
export default handleServiceEvent;
