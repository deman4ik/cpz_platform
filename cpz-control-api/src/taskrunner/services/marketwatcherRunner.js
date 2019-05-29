import ServiceError from "cpz/error";
import Log from "cpz/log";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING
} from "cpz/config/state";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "cpz/events/types/tasks/marketwatcher";
import {
  findMarketwatcherByExchange,
  getMarketwatcherById
} from "cpz/tableStorage-client/control/marketwatchers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

class MarketwatcherRunner extends BaseRunner {
  static async start(props) {
    try {
      let taskId = uuid();
      ServiceValidator.check(TASKS_MARKETWATCHER_START_EVENT, {
        ...props,
        taskId
      });
      const { debug, exchange, providerType, subscriptions } = props;

      const marketwatcher = await findMarketwatcherByExchange(exchange);
      if (marketwatcher) {
        ({ taskId } = marketwatcher);
        if (
          marketwatcher.status === STATUS_STARTED ||
          marketwatcher.status === STATUS_PENDING
        ) {
          const notSubscribed = subscriptions.filter(
            sub =>
              !marketwatcher.subscriptions.find(
                del => del.asset === sub.asset && del.currency === sub.currency
              )
          );
          let event = null;
          if (notSubscribed.length > 0) {
            event = await this.subscribe({
              taskId,
              exchange,
              subscriptions: notSubscribed
            });
          }
          return {
            taskId,
            status: STATUS_STARTED,
            event
          };
        }
      }
      const event = {
        eventType: TASKS_MARKETWATCHER_START_EVENT,
        eventData: {
          subject: exchange,
          data: {
            taskId,
            debug,
            exchange,
            providerType,
            subscriptions
          }
        }
      };

      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to create marketwatcher"
      );
    }
  }

  static async stop(props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_STOP_EVENT, props);
      const { taskId } = props;
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

      const event = {
        eventType: TASKS_MARKETWATCHER_STOP_EVENT,
        eventData: {
          subject: marketwatcher.exchange,
          data: {
            taskId
          }
        }
      };

      return {
        taskId,
        status: STATUS_STOPPING,
        event
      };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to stop marketwatcher"
      );
    }
  }

  static async subscribe(props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, props);
      const { taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher)
        throw new ServiceError(
          {
            name: ServiceError.types.MARKETWATCHER_NOT_FOUND_ERROR,
            info: { taskId }
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
      let event = null;
      if (newSubsciptions.length > 0) {
        event = {
          eventType: TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
          eventData: {
            subject: marketwatcher.exchange,
            data: {
              taskId,
              exchange: marketwatcher.exchange,
              subscriptions
            }
          }
        };
      }
      return { event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to add subscriptions to marketwatcher"
      );
    }
  }

  static async unsubscribe(context, props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, props);
      const { taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher)
        throw new ServiceError(
          {
            name: ServiceError.types.MARKETWATCHER_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to find marketwatcher"
        );
      const event = {
        eventType: TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
        eventData: {
          subject: marketwatcher.exchange,
          data: {
            taskId,
            exchange: marketwatcher.exchange,
            subscriptions
          }
        }
      };
      return { event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to add subscriptions to marketwatcher"
      );
    }
  }
}

export default MarketwatcherRunner;
