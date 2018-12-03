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
  STATUS_STOPPED,
  STATUS_BUSY,
  createCandlebatcherSlug,
  createCandlebatcherTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { isCandlebatcherExists, getCandlebatcherById } from "cpzStorage";
import BaseServiceRunner from "./baseServiceRunner";

class CandlebatcherRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();
      const validate = createValidator(
        TASKS_CANDLEBATCHER_START_EVENT.dataSchema
      );
      genErrorIfExist(validate({ ...props, taskId }));
      const {
        mode,
        debug,
        providerType,
        exchange,
        asset,
        currency,
        timeframes,
        proxy
      } = props;
      if (resume) {
        const candlebatcher = await getCandlebatcherById(taskId);
        if (
          candlebatcher.status === STATUS_STARTED ||
          candlebatcher.status === STATUS_BUSY
        )
          throw new VError(
            {
              name: "CandlebatcherAlreadyStarted",
              info: {
                taskId
              }
            },
            "Candlebatcher already started"
          );
      } else {
        const exists = await isCandlebatcherExists({
          slug: createCandlebatcherSlug({
            mode,
            exchange,
            asset,
            currency
          })
        });
        if (exists)
          throw new VError(
            {
              name: "CandlebatcherAlreadyExists",
              info: {
                taskId
              }
            },
            "Candlebatcher already exists"
          );
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange,
          asset,
          currency,
          mode
        }),
        eventType: TASKS_CANDLEBATCHER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          providerType,
          exchange,
          asset,
          currency,
          timeframes,
          proxy
        }
      });
      return { taskId };
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
      const validate = createValidator(
        TASKS_CANDLEBATCHER_STOP_EVENT.dataSchema
      );

      genErrorIfExist(validate(props));
      const { taskId } = props;
      const candlebatcher = await getCandlebatcherById(taskId);
      if (candlebatcher.status === STATUS_STOPPED)
        throw new VError(
          {
            name: "CandlebatcherAlreadyStopped",
            info: {
              taskId
            }
          },
          "Candlebatcher already stopped"
        );
      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange: candlebatcher.exchange,
          asset: candlebatcher.asset,
          currency: candlebatcher.currency,
          mode: candlebatcher.mode
        }),
        eventType: TASKS_CANDLEBATCHER_STOP_EVENT,
        data: {
          taskId
        }
      });
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
      const validate = createValidator(
        TASKS_CANDLEBATCHER_UPDATE_EVENT.dataSchema
      );
      genErrorIfExist(validate(props));
      const { taskId, debug, timeframes, proxy } = props;
      const candlebatcher = await getCandlebatcherById(taskId);

      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createCandlebatcherTaskSubject({
          exchange: candlebatcher.exchange,
          asset: candlebatcher.asset,
          currency: candlebatcher.currency,
          mode: candlebatcher.mode
        }),
        eventType: TASKS_CANDLEBATCHER_UPDATE_EVENT,
        data: {
          taskId,
          debug,
          timeframes,
          proxy
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
