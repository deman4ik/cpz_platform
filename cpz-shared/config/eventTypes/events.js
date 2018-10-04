const BASE_EVENT = {
  id: {
    description: "An unique identifier for the event.",
    type: "string",
    empty: false
  },
  topic: {
    description: "The resource path of the event source.",
    type: "string",
    empty: false
  },
  subject: {
    description: "A resource path relative to the topic path.",
    type: "string",
    empty: false
  },
  data: {
    description: "Event data specific to the event type.",
    type: "object",
    empty: false
  },
  eventType: {
    description: "The type of the event that occurred.",
    type: "string",
    empty: false
  },
  eventTime: {
    description: "The time (in UTC) the event was generated.",
    format: "date-time",
    type: "string",
    empty: false
  },
  metadataVersion: {
    description: "The schema version of the event metadata.",
    readOnly: true,
    type: "string",
    empty: false
  },
  dataVersion: {
    description: "The schema version of the data object.",
    type: "string",
    empty: false
  }
};
const SUB_VALIDATION_EVENT = {
  eventType: "Microsoft.EventGrid.SubscriptionValidationEvent"
};

const LOG_MARKETWATCHER_EVENT = {
  eventType: "CPZ.MarketWatcher.Log"
};

const LOG_CANDLEBATCHER_EVENT = {
  eventType: "CPZ.Candlebatcher.Log"
};

const LOG_ADVISER_EVENT = {
  eventType: "CPZ.Adviser.Log"
};

const LOG_TRADER_EVENT = {
  eventType: "CPZ.Trader.Log"
};

const ERROR_MARKETWATCHER_EVENT = {
  eventType: "CPZ.MarketWatcher.Error"
};

const ERROR_CANDLEBATCHER_EVENT = {
  eventType: "CPZ.Candlebatcher.Error"
};

const ERROR_ADVISER_EVENT = {
  eventType: "CPZ.Adviser.Error"
};

const ERROR_TRADER_EVENT = {
  eventType: "CPZ.Trader.Error"
};

export {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  LOG_ADVISER_EVENT,
  LOG_CANDLEBATCHER_EVENT,
  LOG_MARKETWATCHER_EVENT,
  LOG_TRADER_EVENT,
  ERROR_ADVISER_EVENT,
  ERROR_CANDLEBATCHER_EVENT,
  ERROR_MARKETWATCHER_EVENT,
  ERROR_TRADER_EVENT
};
