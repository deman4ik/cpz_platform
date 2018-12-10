import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  createMarketwatcherTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE, MARKETWATCHER_SERVICE } from "cpzServices";
import {
  findMarketwatcher,
  getMarketwatcherById,
  findOtherActiveUserRobotsByServiceId
} from "cpzStorage";
import BaseRunner from "../baseRunner";

const validateStart = createValidator(
  TASKS_MARKETWATCHER_START_EVENT.dataSchema
);
const validateStop = createValidator(TASKS_MARKETWATCHER_STOP_EVENT.dataSchema);
const validateSubscribe = createValidator(
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.dataSchema
);
const validateUnsubscribe = createValidator(
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.dataSchema
);
class MarketwatcherRunner extends BaseRunner {
  static async start(props) {
    try {
      // TODO: resume в отдельный метод
      let resume;
      if (props.taskId) {
        resume = true;
      }
      let taskId = props.taskId || uuid();

      genErrorIfExist(validateStart({ ...props, taskId }));
      const { mode, debug, exchange, providerType, subscriptions } = props;

      const marketwatcher = resume
        ? await getMarketwatcherById(taskId)
        : await findMarketwatcher({
            mode,
            exchange
          });

      if (marketwatcher) {
        ({ taskId } = marketwatcher);

        if (
          marketwatcher.status === STATUS_STARTED ||
          marketwatcher.state === STATUS_PENDING
        ) {
          const notSubscribed = subscriptions.filter(
            sub =>
              !marketwatcher.subscriptions.find(
                del => del.asset === sub.asset && del.currency === sub.currency
              )
          );
          if (notSubscribed.length > 0) {
            this.subscribe({
              taskId,
              subscriptions: notSubscribed
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
        subject: createMarketwatcherTaskSubject({ exchange, mode }),
        eventType: TASKS_MARKETWATCHER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          providerType,
          subscriptions
        }
      });
      return { taskId, status: STATUS_STARTING };
    } catch (error) {
      throw new VError(
        {
          name: "MarketwatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to create marketwatcher"
      );
    }
  }

  static async stop(props) {
    try {
      genErrorIfExist(validateStop(props));
      const { taskId, userRobotId } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (marketwatcher.status === STATUS_STOPPED)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      const userRobots = findOtherActiveUserRobotsByServiceId({
        userRobotId,
        taskId,
        serviceName: MARKETWATCHER_SERVICE
      });

      if (userRobots.length > 0) {
        // TODO: Unsubscribe if not used
        return { taskId, status: marketwatcher.status };
      }
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({
          exchange: marketwatcher.exchange,
          mode: marketwatcher.mode
        }),
        eventType: TASKS_MARKETWATCHER_STOP_EVENT,
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
          name: "MarketwatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop marketwatcher"
      );
    }
  }

  static async subscribe(props) {
    try {
      genErrorIfExist(validateSubscribe(props));
      const { taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher)
        throw new VError(
          {
            name: "MarketwatcherNotFound"
          },
          "Failed to find marketwatcher"
        );
      const newSubsciptions = [];
      subscriptions.forEach(subscription => {
        const doubles = marketwatcher.subscriptions.find(
          sub =>
            sub.asset === subscription.asset &&
            sub.currency === subscription.currency
        );
        if (doubles.length === 0) newSubsciptions.add(subscription);
      });
      if (newSubsciptions.length > 0) {
        await publishEvents(TASKS_TOPIC, {
          service: CONTROL_SERVICE,
          subject: createMarketwatcherTaskSubject({
            exchange: marketwatcher.exchange,
            mode: marketwatcher.mode
          }),
          eventType: TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
          data: {
            taskId,

            subscriptions
          }
        });
      }
    } catch (error) {
      throw new VError(
        {
          name: "MarketwatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to add subscriptions to marketwatcher"
      );
    }
  }

  static async unsubscribe(props) {
    try {
      genErrorIfExist(validateUnsubscribe(props));
      const { taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher)
        throw new VError(
          {
            name: "MarketwatcherNotFound"
          },
          "Failed to find marketwatcher"
        );
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({
          exchange: marketwatcher.exchange,
          mode: marketwatcher.mode
        }),
        eventType: TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
        data: {
          taskId,
          subscriptions
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "MarketwatcherRunnerError",
          cause: error,
          info: props
        },
        "Failed to add subscriptions to marketwatcher"
      );
    }
  }
}

export default MarketwatcherRunner;
