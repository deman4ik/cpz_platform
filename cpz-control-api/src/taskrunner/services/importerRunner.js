import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_BUSY,
  STATUS_STOPPED,
  STATUS_FINISHED,
  createImporterSlug
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { CONTROL_SERVICE } from "cpzServices";
import { isActiveImporterExists, getImporterById } from "cpzStorage";
import BaseServiceRunner from "./baseServiceRunner";

class ImporterRunner extends BaseServiceRunner {
  static async start(props) {
    try {
      let resume;
      if (props.taskId) {
        resume = true;
      }
      const taskId = props.taskId || uuid();
      const validate = createValidator(TASKS_IMPORTER_START_EVENT.dataSchema);
      genErrorIfExist(validate({ ...props, taskId }));
      const {
        mode,
        debug,
        providerType,
        exchange,
        asset,
        currency,
        timeframes,
        requireBatching,
        warmUpCache,
        dateFrom,
        dateTo,
        proxy
      } = props;
      if (resume) {
        const importer = await getImporterById(taskId);
        if (
          importer.status === STATUS_STARTED ||
          importer.status === STATUS_BUSY
        )
          throw new VError(
            {
              name: "ImporterAlreadyStarted",
              info: {
                taskId
              }
            },
            "Importer already started"
          );
      } else {
        const exists = await isActiveImporterExists({
          slug: createImporterSlug({
            mode,
            exchange,
            asset,
            currency
          }),
          dateFrom,
          dateTo
        });
        if (exists)
          throw new VError(
            {
              name: "ImporterAlreadyExists",
              info: {
                taskId
              }
            },
            "Importer already exists"
          );
      }

      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createImporterSlug({ exchange, asset, currency, mode }),
        eventType: TASKS_IMPORTER_START_EVENT,
        data: {
          taskId,
          mode,
          debug,
          providerType,
          exchange,
          asset,
          currency,
          timeframes,
          requireBatching,
          warmUpCache,
          dateFrom,
          dateTo,
          proxy
        }
      });
      return { taskId };
    } catch (error) {
      throw new VError(
        {
          name: "ImporterRunnerError",
          cause: error,
          info: props
        },
        "Failed to start importer"
      );
    }
  }

  static async stop(props) {
    try {
      const validate = createValidator(TASKS_IMPORTER_STOP_EVENT.dataSchema);

      genErrorIfExist(validate(props));
      const { taskId } = props;
      const importer = await getImporterById(taskId);
      if (importer.status === STATUS_FINISHED)
        throw new VError(
          {
            name: "ImporteAlreadyFinished",
            info: {
              taskId
            }
          },
          "Importe already finished"
        );
      if (importer.status === STATUS_STOPPED)
        throw new VError(
          {
            name: "ImporteAlreadyStopped",
            info: {
              taskId
            }
          },
          "Importe already stopped"
        );
      await publishEvents(TASKS_TOPIC, {
        service: CONTROL_SERVICE,
        subject: createImporterSlug({
          exchange: importer.exchange,
          asset: importer.asset,
          currency: importer.currency,
          mode: importer.mode
        }),
        eventType: TASKS_IMPORTER_STOP_EVENT,
        data: {
          taskId
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "ImporterRunnerError",
          cause: error,
          info: props
        },
        "Failed to stop importer"
      );
    }
  }
}

export default ImporterRunner;
