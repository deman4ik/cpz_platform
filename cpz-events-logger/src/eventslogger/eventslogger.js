import DB from "cpzDB";
import {
  saveTasksEvent,
  saveSignalsEvent,
  saveOrdersEvent,
  savePositionsEvent,
  saveLogsEvent,
  saveErrorsEvent
} from "cpzStorage";
import { CANDLES_NEWCANDLE_EVENT } from "cpzEventTypes";

class EventsLogger {
  constructor(context) {
    this.context = context;
    this.db = new DB();
    this.logToStorage = process.env.LOG_TABLE_STORAGE;
    this.logToPostgre = process.env.LOG_POSTGRE;
  }

  async save(event) {
    try {
      const type = event.eventType;
      if (type === CANDLES_NEWCANDLE_EVENT.eventType) {
        if (this.logToPostgre)
          await this.db.saveCandles({
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
        //  if (this.logToPostgre) await this.db.saveTasksEvent(eventData);
        return;
      }
      if (type.includes("CPZ.Signals")) {
        if (this.logToStorage) await saveSignalsEvent(fullEventData);
        if (this.logToPostgre) await this.db.saveSignals([fullEventData]);
        return;
      }
      if (type.includes("CPZ.Orders")) {
        if (this.logToStorage) await saveOrdersEvent(fullEventData);
        if (this.logToPostgre) await this.db.saveOrders([fullEventData]);
        return;
      }
      if (type.includes("CPZ.Positions")) {
        if (this.logToStorage) await savePositionsEvent(fullEventData);
        if (this.logToPostgre) await this.db.savePositions([fullEventData]);
        return;
      }
      if (type.includes(".Log")) {
        if (this.logToStorage) await saveLogsEvent(fullEventData);
        // if (this.logToPostgre) await this.db.saveLogEvent(eventData);
        return;
      }
      if (type.includes(".Error")) {
        if (this.logToStorage) await saveErrorsEvent(fullEventData);
        // if (this.logToPostgre) await this.db.saveErrorEvent(eventData);
        return;
      }
    } catch (error) {
      this.context.log.error(error);
    }
  }
}

export default EventsLogger;
