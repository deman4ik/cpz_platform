import VError from "verror";
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
import publishEvents from "cpz/eventgrid";
import {
  findActiveImporter,
  getImporterById
} from "cpz/tableStorage/importers";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";

import config from "../../config";

const {
  serviceName,
  events: {
    types: { TASKS_IMPORTER_START_EVENT, TASKS_IMPORTER_STOP_EVENT },
    topics: { TASKS_TOPIC }
  }
} = config;

class ImporterRunner extends BaseRunner {
  static async start(context, props) {
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

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createImporterSlug({ exchange, asset, currency }),
        eventType: TASKS_IMPORTER_START_EVENT,
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
      });
      return { taskId, status: STATUS_STARTING };
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

  static async stop(context, props) {
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

      await publishEvents(TASKS_TOPIC, {
        service: serviceName,
        subject: createImporterSlug({
          exchange: importer.exchange,
          asset: importer.asset,
          currency: importer.currency
        }),
        eventType: TASKS_IMPORTER_STOP_EVENT,
        data: {
          taskId
        }
      });
      return { taskId, status: STATUS_STOPPING };
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
