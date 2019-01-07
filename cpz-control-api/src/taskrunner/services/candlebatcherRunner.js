import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_BUSY,
  createCandlebatcherSlug,
  createCandlebatcherTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE, CANDLEBATCHER_SERVICE } from "cpzServices";
import {
  findCandlebatcher,
  getCandlebatcherById,
  getExWatcherById
} from "cpzStorage";
import { arraysDiff } from "cpzUtils/helpers";
import BaseRunner from "../baseRunner";

const validateStart = createValidator(
  TASKS_CANDLEBATCHER_START_EVENT.dataSchema
);
const validateStop = createValidator(TASKS_CANDLEBATCHER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(
  TASKS_CANDLEBATCHER_UPDATE_EVENT.dataSchema
);

class CandlebatcherRunner extends BaseRunner {
  static async start(props) {
    try {
      // TODO: resume в отдельный метод
      let resume;
      if (props.taskId) {
        resume = true;
      }
      let taskId = props.taskId || uuid();

      genErrorIfExist(validateStart({ ...props, taskId }));
      const {
        settings,
        providerType,
        exchange,
        asset,
        currency,
        timeframes
      } = props;

      const candlebatcher = resume
        ? await getCandlebatcherById(taskId)
        : await findCandlebatcher({
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
            this.update({
              taskId,
              settings,
              timeframes: [
                ...new Set([...candlebatcher.timeframes, ...timeframes])
              ]
            });
          }
          return {
            taskId,
            status: STATUS_STARTED
          };
        }
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange,
          asset,
          currency
        }),
        eventType: TASKS_CANDLEBATCHER_START_EVENT,
        data: {
          taskId,
          settings,
          providerType,
          exchange,
          asset,
          currency,
          timeframes
        }
      });
      return { taskId, status: STATUS_STARTING };
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to start candlebatcher"
      );
    }
  }

  static async stop(props) {
    try {
      genErrorIfExist(validateStop(props));
      const { taskId, exWatcherId } = props;
      const candlebatcher = await getCandlebatcherById(taskId);
      if (!candlebatcher)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (candlebatcher.status === STATUS_STOPPED)
        return {
          taskId,
          status: STATUS_STOPPED
        };

      const exWatcher = getExWatcherById(exWatcherId);

      if (exWatcher) {
        return { taskId, status: candlebatcher.status };
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange: candlebatcher.exchange,
          asset: candlebatcher.asset,
          currency: candlebatcher.currency
        }),
        eventType: TASKS_CANDLEBATCHER_STOP_EVENT,
        data: {
          taskId
        }
      });
      return {
        taskId,
        status: STATUS_STOPPING
      };
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop candlebatcher"
      );
    }
  }

  static async update(props) {
    try {
      genErrorIfExist(validateUpdate(props));
      const { taskId, timeframes, settings } = props;
      const candlebatcher = await getCandlebatcherById(taskId);
      if (!candlebatcher)
        throw new VError(
          {
            name: "CandlebatcherNotFound"
          },
          "Failed to find candlebatcher"
        );
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange: candlebatcher.exchange,
          asset: candlebatcher.asset,
          currency: candlebatcher.currency
        }),
        eventType: TASKS_CANDLEBATCHER_UPDATE_EVENT,
        data: {
          taskId,
          settings,
          timeframes
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to update candlebatcher"
      );
    }
  }
}

export default CandlebatcherRunner;
