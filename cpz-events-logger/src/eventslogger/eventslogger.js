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
      const eventData = {
        RowKey: event.id,
        PartitionKey: event.subject,
        eventId: event.id,
        eventTopic: event.topic,
        eventSubject: event.subject,
        eventType: event.eventType,
        eventTime: event.eventTime,
        eventMetadataVersion: event.metadataVersion,
        eventDataVersion: event.dataVersion,
        ...event.data
      };
      if (type === CANDLES_NEWCANDLE_EVENT.eventType) {
        if (this.logToPostgre)
          await this.db.saveCandles({
            timeframe: event.data.timeframe,
            candles: [event.data]
          });
      }
      if (type.includes("CPZ.Tasks")) {
        if (this.logToStorage) await saveTasksEvent(eventData);
        //  if (this.logToPostgre) await this.db.saveTasksEvent(eventData);
      }
      if (type.includes("CPZ.Signals")) {
        if (this.logToStorage) await saveSignalsEvent(eventData);
        // if (this.logToPostgre) await this.db.saveSignal(eventData);
      }
      if (type.includes("CPZ.Orders")) {
        if (this.logToStorage) await saveOrdersEvent(eventData);
        //  if (this.logToPostgre) await this.db.saveOrder(eventData);
      }
      if (type.includes("CPZ.Positions")) {
        if (this.logToStorage) await savePositionsEvent(eventData);
        //  if (this.logToPostgre) await this.db.savePosition(eventData);
      }
      if (type.includes(".Log")) {
        if (this.logToStorage) await saveLogsEvent(eventData);
        // if (this.logToPostgre) await this.db.saveLogEvent(eventData);
      }
      if (type.includes(".Error")) {
        if (this.logToStorage) await saveErrorsEvent(eventData);
        // if (this.logToPostgre) await this.db.saveErrorEvent(eventData);
      }
    } catch (error) {
      this.context.log.error(error);
    }
  }
}

export default EventsLogger;
