import ServiceError from "cpz/error";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_BUSY,
  createCandlebatcherSlug,
  createCandlebatcherTaskSubject
} from "cpz/config/state";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT
} from "cpz/events/types/tasks/candlebatcher";
import {
  findCandlebatcher,
  getCandlebatcherById
} from "cpz/tableStorage-client/control/candlebatchers";
import { arraysDiff } from "cpz/utils/helpers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

class CandlebatcherRunner extends BaseRunner {
  static async start(props) {
    try {
      let taskId = uuid();

      ServiceValidator.check(TASKS_CANDLEBATCHER_START_EVENT, {
        ...props,
        taskId
      });
      const {
        settings,
        providerType,
        exchange,
        asset,
        currency,
        timeframes
      } = props;

      const candlebatcher = await findCandlebatcher({
        slug: createCandlebatcherSlug({
          exchange,
          asset,
          currency
        })
      });

      if (candlebatcher) {
        ({ taskId } = candlebatcher);

        if (
          candlebatcher.status === STATUS_STARTED ||
          candlebatcher.status === STATUS_BUSY
        ) {
          const notSubscribedTimeframes = arraysDiff(
            timeframes,
            candlebatcher.timeframes
          );
          if (notSubscribedTimeframes.length > 0) {
            const { event } = this.update({
              taskId,
              settings,
              timeframes: [
                ...new Set([...candlebatcher.timeframes, ...timeframes])
              ]
            });
            return { taskId, status: STATUS_STARTED, event };
          }
          return {
            taskId,
            status: STATUS_STARTED
          };
        }
      }

      const event = {
        eventType: TASKS_CANDLEBATCHER_START_EVENT,
        eventData: {
          subject: createCandlebatcherTaskSubject({
            exchange,
            asset,
            currency
          }),
          data: {
            taskId,
            settings,
            providerType,
            exchange,
            asset,
            currency,
            timeframes
          }
        }
      };

      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to start candlebatcher"
      );
    }
  }

  static async stop(props) {
    try {
      ServiceValidator.check(TASKS_CANDLEBATCHER_STOP_EVENT, props);
      const { taskId } = props;
      const candlebatcher = await getCandlebatcherById(taskId);
      if (!candlebatcher || candlebatcher.status === STATUS_STOPPED)
        return {
          taskId,
          status: STATUS_STOPPED
        };

      const error = {
        eventType: TASKS_CANDLEBATCHER_STOP_EVENT,
        eventData: {
          subject: createCandlebatcherTaskSubject({
            exchange: candlebatcher.exchange,
            asset: candlebatcher.asset,
            currency: candlebatcher.currency
          }),
          data: {
            taskId
          }
        }
      };

      return {
        taskId,
        status: STATUS_STOPPING,
        error
      };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to stop candlebatcher"
      );
    }
  }

  static async update(props) {
    try {
      ServiceValidator.check(TASKS_CANDLEBATCHER_UPDATE_EVENT, props);
      const { taskId, timeframes, settings } = props;
      const candlebatcher = await getCandlebatcherById(taskId);
      if (!candlebatcher)
        throw new ServiceError(
          {
            name: ServiceError.types.CANDLEBATCHER_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to find candlebatcher"
        );
      const event = {
        eventType: TASKS_CANDLEBATCHER_UPDATE_EVENT,
        eventData: {
          subject: createCandlebatcherTaskSubject({
            exchange: candlebatcher.exchange,
            asset: candlebatcher.asset,
            currency: candlebatcher.currency
          }),
          data: {
            taskId,
            settings,
            timeframes
          }
        }
      };

      return { event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.CANDLEBATCHER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to update candlebatcher"
      );
    }
  }
}

export default CandlebatcherRunner;
