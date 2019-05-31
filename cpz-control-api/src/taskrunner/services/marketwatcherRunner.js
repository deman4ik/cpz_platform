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
          return {
            taskId,
            status: STATUS_STARTED,
            event: null
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
      let taskId = uuid();
      ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, {
        ...props,
        taskId
      });
      const { exchange, subscriptions } = props;
      const marketwatcher = await findMarketwatcherByExchange(exchange);
      if (!marketwatcher) return await this.start(props);
      ({ taskId } = marketwatcher);
      const notSubscribed = subscriptions.filter(
        sub =>
          !marketwatcher.subscriptions.find(
            del => del.asset === sub.asset && del.currency === sub.currency
          )
      );

      let event = null;
      if (notSubscribed.length > 0) {
        event = {
          eventType: TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
          eventData: {
            subject: marketwatcher.exchange,
            data: {
              taskId: marketwatcher.taskId,
              exchange: marketwatcher.exchange,
              subscriptions: notSubscribed
            }
          }
        };
      }
      return {
        taskId: marketwatcher.taskId,
        status: marketwatcher.status,
        event
      };
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

  static async unsubscribe(props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, props);
      const { taskId, subscriptions } = props;
      const marketwatcher = await getMarketwatcherById(taskId);
      if (!marketwatcher) return { taskId, status: STATUS_STOPPED };
      const subscribed = subscriptions.filter(sub =>
        marketwatcher.subscriptions.find(
          del => del.asset === sub.asset && del.currency === sub.currency
        )
      );
      if (subscribed.length > 0) {
        if (marketwatcher.subscriptions.length === 1)
          return await this.stop(props);
        const event = {
          eventType: TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
          eventData: {
            subject: marketwatcher.exchange,
            data: {
              taskId: marketwatcher.taskId,
              exchange: marketwatcher.exchange,
              subscriptions: subscribed
            }
          }
        };
        return {
          taskId: marketwatcher.taskId,
          statys: marketwatcher.status,
          event
        };
      }
      return {
        taskId: marketwatcher.taskId,
        statys: marketwatcher.status,
        event: null
      };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_RUNNER_ERROR,
          cause: error,
          info: props
        },
        "Failed to remove subscriptions from marketwatcher"
      );
    }
  }
}

export default MarketwatcherRunner;
