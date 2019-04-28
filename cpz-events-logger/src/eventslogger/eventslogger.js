import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import { createCurrentPriceSlug } from "cpz/config/state";
import {
  saveTasksEvent,
  saveSignalsEvent,
  saveOrdersEvent,
  savePositionsEvent,
  saveLogsEvent,
  saveErrorsEvent
} from "cpz/tableStorage-client/events/events";
import Log from "cpz/log";
import { ERROR_TOPIC } from "cpz/events/topics";
import { saveCurrentPrice } from "cpz/tableStorage-client/market/currentPrices";
import { saveCandlesDB } from "cpz/db-client/candles";
import { saveSignalsDB } from "cpz/db-client/signals";
import { saveEventPositionsDB } from "cpz/db-client/positions";
import { saveOrdersDB } from "cpz/db-client/orders";
import { saveUserRobotHistDB } from "cpz/db-client/userRobotHist";
import { CANDLES_NEWCANDLE_EVENT } from "cpz/events/types/candles";
import { SIGNALS_NEWSIGNAL_EVENT } from "cpz/events/types/signals";
import {
  TRADES_ORDER_EVENT,
  TRADES_POSITION_EVENT
} from "cpz/events/types/trades";
import { TASKS_USERROBOT_HIST_EVENT } from "cpz/events/types/tasks/userRobot";
import { SERVICE_NAME } from "../config";

class EventsLogger {
  constructor() {
    this.logToStorage = process.env.LOG_TABLE_STORAGE;
    this.logToPostgre = process.env.LOG_POSTGRE;
  }

  async save(event) {
    try {
      const type = event.eventType;
      if (type === CANDLES_NEWCANDLE_EVENT) {
        if (this.logToStorage) {
          const {
            id,
            time,
            timestamp,
            close,
            exchange,
            asset,
            currency,
            timeframe
          } = event.data;
          if (timeframe === 1) {
            const slug = createCurrentPriceSlug({ exchange, asset, currency });
            await saveCurrentPrice({
              PartitionKey: slug,
              RowKey: "candle",
              time,
              timestamp,
              price: close,
              candleId: id,
              tickId: null
            });
          }
        }
        if (this.logToPostgre)
          await saveCandlesDB({
            timeframe: event.data.timeframe,
            candles: [event.data]
          });
        return;
      }
      const baseEventData = {
        RowKey: event.id,
        PartitionKey: type
          .split(".")
          .slice(-2)
          .join("."),
        eventId: event.id,
        eventTopic: event.topic,
        eventSubject: event.subject,
        eventType: event.eventType,
        eventTime: event.eventTime,
        eventMetadataVersion: event.metadataVersion,
        eventDataVersion: event.dataVersion
      };
      const fullEventData = {
        ...baseEventData,
        ...event.data
      };

      if (type.includes("CPZ.Tasks")) {
        if (this.logToStorage)
          await saveTasksEvent({
            ...baseEventData,
            data: event.data
          });
        if (type === TASKS_USERROBOT_HIST_EVENT) {
          if (this.logToPostgre) await saveUserRobotHistDB([fullEventData]);
        }
        return;
      }
      if (type.includes("CPZ.Signals")) {
        if (this.logToStorage) await saveSignalsEvent(fullEventData);
        if (type === SIGNALS_NEWSIGNAL_EVENT) {
          if (this.logToPostgre) await saveSignalsDB([fullEventData]);
        }
        return;
      }
      if (type === TRADES_ORDER_EVENT) {
        if (this.logToStorage) await saveOrdersEvent(fullEventData);
        if (this.logToPostgre) await saveOrdersDB([fullEventData]);
        return;
      }
      if (type === TRADES_POSITION_EVENT) {
        if (this.logToStorage) await savePositionsEvent(fullEventData);
        if (this.logToPostgre) await saveEventPositionsDB([fullEventData]);

        return;
      }
      if (type.includes(".Log")) {
        if (this.logToStorage) await saveLogsEvent(fullEventData);
        // if (this.logToPostgre) await saveLogEventDB(eventData);
        return;
      }
      if (type.includes(".Error")) {
        if (this.logToStorage) await saveErrorsEvent(fullEventData);
        // if (this.logToPostgre) await saveErrorEventDB(eventData);
        return;
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EVENTSLOGGER_LOG_EVENT_ERROR,
          cause: e,
          info: {
            ...event
          }
        },
        "Failed to log event."
      );
      Log.exception(error);
      try {
        const id = uuid();
        await saveErrorsEvent({
          RowKey: id,
          PartitionKey: `Eventslogger.Error`,
          eventId: id,
          eventTopic: ERROR_TOPIC,
          eventSubject: SERVICE_NAME,
          eventType: "CPZ.Eventslogger.Error",
          eventTime: dayjs.utc().toDate(),
          eventMetadataVersion: null,
          eventDataVersion: null,
          error: error.json
        });
      } catch (saveLogError) {
        Log.exception(saveLogError);
      }
    }
  }
}

export default EventsLogger;
