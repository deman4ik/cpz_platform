import ServiceError from "cpz/error";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_BUSY,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_FINISHED,
  createImporterSlug
} from "cpz/config/state";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT
} from "cpz/events/types/tasks/importer";
import {
  findActiveImporter,
  getImporterById
} from "cpz/tableStorage-client/control/importers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

class ImporterRunner extends BaseRunner {
  static async start(props) {
    try {
      const taskId = props.taskId || uuid();

      ServiceValidator.check(TASKS_IMPORTER_START_EVENT, { ...props, taskId });
      const {
        debug,
        providerType,
        exchange,
        asset,
        currency,
        timeframes,
        requireBatching,
        saveToCache,
        warmUpCache,
        dateFrom,
        dateTo,
        proxy
      } = props;

      const importer = await findActiveImporter({
        slug: createImporterSlug({
          exchange,
          asset,
          currency
        }),
        dateFrom,
        dateTo
      });

      if (importer) {
        if (
          importer.status === STATUS_STARTED ||
          importer.status === STATUS_BUSY
        )
          return {
            taskId,
            status: STATUS_STARTED
          };
      }

      const event = {
        eventType: TASKS_IMPORTER_START_EVENT,
        eventData: {
          subject: createImporterSlug({ exchange, asset, currency }),
          data: {
            taskId,
            debug,
            providerType,
            exchange,
            asset,
            currency,
            timeframes,
            requireBatching,
            saveToCache,
            warmUpCache,
            dateFrom,
            dateTo,
            proxy
          }
        }
      };

      return { taskId, status: STATUS_STARTING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.IMPORTER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to start importer"
      );
    }
  }

  static async stop(props) {
    try {
      ServiceValidator.check(TASKS_IMPORTER_STOP_EVENT, props);
      const { taskId } = props;
      const importer = await getImporterById(taskId);
      if (!importer)
        return {
          taskId,
          status: STATUS_STOPPED
        };
      if (
        importer.status === STATUS_FINISHED ||
        importer.status === STATUS_STOPPED
      )
        return { taskId, status: importer.status };

      const event = {
        eventType: TASKS_IMPORTER_STOP_EVENT,
        eventData: {
          subject: createImporterSlug({
            exchange: importer.exchange,
            asset: importer.asset,
            currency: importer.currency
          }),
          data: {
            taskId
          }
        }
      };

      return { taskId, status: STATUS_STOPPING, event };
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.IMPORTER_RUNNER_ERROR,
          cause: error,
          info: { ...props }
        },
        "Failed to stop importer"
      );
    }
  }
}

export default ImporterRunner;
