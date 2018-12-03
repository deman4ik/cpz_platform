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
  STATUS_STOPPED,
  STATUS_PENDING,
  createMarketwatcherTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { isMarketwatcherExists, getMarketwatcherById } from "cpzStorage";
import BaseServiceRunner from "./baseServiceRunner";

class MarketwatcherRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();
      const validate = createValidator(
        TASKS_MARKETWATCHER_START_EVENT.dataSchema
      );
      genErrorIfExist(validate({ ...props, taskId }));
      const { hostId, mode, debug, providerType, subscriptions } = props;
      if (resume) {
        const marketwatcher = await getMarketwatcherById({
          hostId,
          taskId
        });

        if (
          marketwatcher.status === STATUS_STARTED ||
          marketwatcher.state === STATUS_PENDING
        )
          throw new VError(
            {
              name: "MarketwatcherAlreadyStarted",
              info: {
                taskId
              }
            },
            "Marketwatcher already started"
          );
      } else {
        const exists = await isMarketwatcherExists({
          mode,
          providerType,
          subscriptions
        });
        if (exists)
          throw new VError(
            {
              name: "MarketwatcherAlreadyExists",
              info: {
                taskId
              }
            },
            "Marketwatcher already exists"
          );
      }
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({ hostId, taskId, mode }),
        eventType: TASKS_MARKETWATCHER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          providerType,
          subscriptions
        }
      });
      return { taskId };
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
      const validate = createValidator(
        TASKS_MARKETWATCHER_STOP_EVENT.dataSchema
      );

      genErrorIfExist(validate(props));
      const { hostId, taskId } = props;
      const marketwatcher = await getMarketwatcherById({
        hostId,
        taskId
      });
      if (marketwatcher.status === STATUS_STOPPED)
        throw new VError(
          {
            name: "MarketwatcherAlreadyStopped",
            info: {
              taskId
            }
          },
          "Marketwatcher already stopped"
        );
      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({
          hostId: marketwatcher.hostId,
          taskId: marketwatcher.taskId,
          mode: marketwatcher.mode
        }),
        eventType: TASKS_MARKETWATCHER_STOP_EVENT,
        data: {
          taskId,
          hostId
        }
      });
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
      const validate = createValidator(
        TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.dataSchema
      );
      genErrorIfExist(validate(props));
      const { hostId, taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById({
        hostId,
        taskId
      });

      subscriptions.forEach(subscription => {
        const doubles = marketwatcher.subscriptions.find(
          sub =>
            sub.exchange === subscription.exchange &&
            sub.asset === subscription.asset &&
            sub.currency === subscription.currency
        );
        if (doubles.length > 0)
          throw new VError(
            {
              name: "MarketwatcherAlreadySubscribed",
              info: {
                taskId: marketwatcher.taskId,
                hostId: marketwatcher.hostId,
                mode: marketwatcher.mode,
                subscriptions: marketwatcher.subscriptions
              }
            },
            "Marketwatcher already subscribed"
          );
      });
      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({
          hostId: marketwatcher.hostId,
          taskId: marketwatcher.taskId,
          mode: marketwatcher.mode
        }),
        eventType: TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
        data: {
          taskId,
          hostId,
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

  static async unsubscribe(props) {
    try {
      const validate = createValidator(
        TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.dataSchema
      );
      genErrorIfExist(validate(props));
      const { hostId, taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById({
        hostId,
        taskId
      });

      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createMarketwatcherTaskSubject({
          hostId: marketwatcher.hostId,
          taskId: marketwatcher.taskId,
          mode: marketwatcher.mode
        }),
        eventType: TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
        data: {
          taskId,
          hostId,
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
