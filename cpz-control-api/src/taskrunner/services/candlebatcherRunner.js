import VError from "verror";
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
import publishEvents from "cpz/eventgrid";
import {
  findCandlebatcher,
  getCandlebatcherById
} from "cpz/tableStorage/candlebatchers";
import { arraysDiff } from "cpz/utils/helpers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

import config from "../../config";

const {
  serviceName,
  events: {
    types: {
      TASKS_CANDLEBATCHER_START_EVENT,
      TASKS_CANDLEBATCHER_STOP_EVENT,
      TASKS_CANDLEBATCHER_UPDATE_EVENT
    },
    topics: { TASKS_TOPIC }
  }
} = config;


class CandlebatcherRunner extends BaseRunner {
  static async start(context, props) {
    try {
      let taskId = uuid();

      ServiceValidator.check(TASKS_CANDLEBATCHER_START_EVENT, { ...props, taskId });
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
        service: serviceName,
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

  static async stop(context, props) {
    try {
      ServiceValidator.check(TASKS_CANDLEBATCHER_STOP_EVENT, props);
      const { taskId } = props;
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

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
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

  static async update(context, props) {
    try {
      ServiceValidator.check(TASKS_CANDLEBATCHER_UPDATE_EVENT, props);
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
        service: serviceName,
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
