import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  createAdviserTaskSubject
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { isAdviserExists, getAdviserById } from "cpzStorage";
import BaseServiceRunner from "./baseServiceRunner";

class AdviserRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();
      const validate = createValidator(TASKS_ADVISER_START_EVENT.dataSchema);
      genErrorIfExist(validate({ ...props, taskId }));
      const {
        mode,
        debug,
        strategyName,
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        settings,
        requiredHistoryCache,
        requiredHistoryMaxBars
      } = props;
      if (resume) {
        const adviser = await getAdviserById(taskId);
        if (adviser.status === STATUS_STARTED || adviser.status === STATUS_BUSY)
          throw new VError(
            {
              name: "AdviserAlreadyStarted",
              info: {
                taskId
              }
            },
            "Adviser already started"
          );
      } else {
        const exists = await isAdviserExists({
          mode,
          robotId
        });
        if (exists)
          throw new VError(
            {
              name: "AdviserAlreadyExists",
              info: {
                taskId
              }
            },
            "Adviser already exists"
          );
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createAdviserTaskSubject({
          exchange,
          asset,
          currency,
          timeframe,
          robotId,
          mode
        }),
        eventType: TASKS_ADVISER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          strategyName,
          robotId,
          exchange,
          asset,
          currency,
          timeframe,
          settings,
          requiredHistoryCache,
          requiredHistoryMaxBars
        }
      });
      return { taskId };
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to start adviser"
      );
    }
  }

  static async stop(props) {
    try {
      const validate = createValidator(TASKS_ADVISER_STOP_EVENT.dataSchema);

      genErrorIfExist(validate(props));
      const { taskId } = props;
      const adviser = await getAdviserById(taskId);
      if (adviser.status === STATUS_STOPPED)
        throw new VError(
          {
            name: "AdviserAlreadyStopped",
            info: {
              taskId
            }
          },
          "Adviser already stopped"
        );
      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createAdviserTaskSubject({
          exchange: adviser.exchange,
          asset: adviser.asset,
          currency: adviser.currency,
          timeframe: adviser.timeframe,
          robotId: adviser.robotId,
          mode: adviser.mode
        }),
        eventType: TASKS_ADVISER_STOP_EVENT,
        data: {
          taskId
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop adviser"
      );
    }
  }

  static async update(props) {
    try {
      const validate = createValidator(TASKS_ADVISER_UPDATE_EVENT.dataSchema);
      genErrorIfExist(validate(props));
      const {
        taskId,
        debug,
        settings,
        requiredHistoryCache,
        requiredHistoryMaxBars
      } = props;
      const adviser = await getAdviserById(taskId);

      // TODO: Check Robot
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createAdviserTaskSubject({
          exchange: adviser.exchange,
          asset: adviser.asset,
          currency: adviser.currency,
          timeframe: adviser.timeframe,
          robotId: adviser.robotId,
          mode: adviser.mode
        }),
        eventType: TASKS_ADVISER_UPDATE_EVENT,
        data: {
          taskId,
          debug,
          settings,
          requiredHistoryCache,
          requiredHistoryMaxBars
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserRunnerError",
          cause: error,
          info: props
        },
        "Failed to update adviser"
      );
    }
  }
}

export default AdviserRunner;
