import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING
} from "cpz/config/state";
import publishEvents from "cpz/eventgrid";
import {
  findMarketwatcherByExchange,
  getMarketwatcherById
} from "cpz/tableStorage/marketwatchers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

import config from "../../config";

const {
  serviceName,
  events: {
    types: {
      TASKS_MARKETWATCHER_START_EVENT,
      TASKS_MARKETWATCHER_STOP_EVENT,
      TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
      TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
    },
    topics: { TASKS_TOPIC }
  }
} = config;
class MarketwatcherRunner extends BaseRunner {
  static async start(context, props) {
    try {
      let taskId = uuid();
      ServiceValidator.check(TASKS_MARKETWATCHER_START_EVENT, { ...props, taskId });
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
        service: serviceName,
        subject: exchange,
        eventType: TASKS_MARKETWATCHER_START_EVENT,
        data: {
          taskId,
          debug,
          exchange,
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

  static async stop(context, props) {
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
      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: marketwatcher.exchange,
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

  static async subscribe(context, props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, props);
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
          service: serviceName,
          subject: marketwatcher.exchange,
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

  static async unsubscribe(context, props) {
    try {
      ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, props);
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
        service: serviceName,
        subject: marketwatcher.exchange,
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
