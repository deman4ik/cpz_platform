import { createCurrentPriceSlug } from "cpz/config/state";
import {
  saveTasksEvent,
  saveSignalsEvent,
  saveOrdersEvent,
  savePositionsEvent,
  saveLogsEvent,
  saveErrorsEvent
} from "cpz/tableStorage/events";
import Log from "cpz/log";
import { saveCurrentPrice } from "cpz/tableStorage/currentPrices";
import {
  saveCandlesDB,
  saveSignalsDB,
  saveOrdersDB,
  savePositionsDB
} from "cpz/db";
import config from "../config";

const {
  events: {
    types: {
      CANDLES_NEWCANDLE_EVENT,
      SIGNALS_NEWSIGNAL_EVENT,
      TRADES_ORDER_EVENT,
      TRADES_POSITION_EVENT
    }
  }
} = config;

class EventsLogger {
  constructor(context) {
    this.context = context;
    this.logToStorage = process.env.LOG_TABLE_STORAGE;
    this.logToPostgre = process.env.LOG_POSTGRE;
  }

  async save(event) {
    try {
      const type = event.eventType;
      if (type === CANDLES_NEWCANDLE_EVENT.eventType) {
        if (this.logToStorage) {
          const {
            id,
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
              RowKey: slug,
              timestamp,
              price: close,
              candleId: id,
              tickId: null,
              source: "candle"
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
        // TODO: SAVE TO DB USER ROBOT TASK EVENTS
        /*  if (
          type === TASKS_USERROBOT_STARTED_EVENT.eventType ||
          type === TASKS_USERROBOT_STOPPED_EVENT.eventType
        ) {
          if (this.logToPostgre) await saveUserRobotHistDB([fullEventData]);
        } */
        return;
      }
      if (type.includes("CPZ.Signals")) {
        if (this.logToStorage) await saveSignalsEvent(fullEventData);
        if (type === SIGNALS_NEWSIGNAL_EVENT.eventType) {
          if (this.logToPostgre) await saveSignalsDB([fullEventData]);
        }
        return;
      }
      if (type === TRADES_ORDER_EVENT.eventType) {
        if (this.logToStorage) await saveOrdersEvent(fullEventData);
        if (this.logToPostgre) await saveOrdersDB([fullEventData]);
        return;
      }
      if (type === TRADES_POSITION_EVENT.eventType) {
        if (this.logToStorage) await savePositionsEvent(fullEventData);
        if (this.logToPostgre) await savePositionsDB([fullEventData]);

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
    } catch (error) {
      Log.error(error);
    }
  }
}

export default EventsLogger;
