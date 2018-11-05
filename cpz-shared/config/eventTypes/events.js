const BASE_EVENT = {
  dataSchema: {
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
      type: "string",
      empty: false
    },
    metadataVersion: {
      description: "The schema version of the event metadata.",
      type: "string",
      empty: false
    },
    dataVersion: {
      description: "The schema version of the data object.",
      type: "string",
      empty: false
    }
  }
};

const BASE_ERROR = {
  type: "object",
  description: "Error object if something goes wrong.",
  optional: true,
  props: {
    name: {
      description: "Error name.",
      type: "string",
      empty: false
    },
    message: {
      description: "Error message.",
      type: "string",
      empty: false
    },
    info: {
      description: "Error details.",
      type: "object",
      optional: true
    },
    stack: {
      description: "Error stack.",
      type: "string",
      optional: true,
      empty: false
    }
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

const LOG_IMPORTER_EVENT = {
  eventType: "CPZ.Importer.Log"
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

const ERROR_IMPORTER_EVENT = {
  eventType: "CPZ.Importer.Error"
};

const ERROR_ADVISER_EVENT = {
  eventType: "CPZ.Adviser.Error"
};

const ERROR_TRADER_EVENT = {
  eventType: "CPZ.Trader.Error"
};

export {
  BASE_EVENT,
  BASE_ERROR,
  SUB_VALIDATION_EVENT,
  LOG_ADVISER_EVENT,
  LOG_CANDLEBATCHER_EVENT,
  LOG_IMPORTER_EVENT,
  LOG_MARKETWATCHER_EVENT,
  LOG_TRADER_EVENT,
  ERROR_ADVISER_EVENT,
  ERROR_CANDLEBATCHER_EVENT,
  ERROR_IMPORTER_EVENT,
  ERROR_MARKETWATCHER_EVENT,
  ERROR_TRADER_EVENT
};
