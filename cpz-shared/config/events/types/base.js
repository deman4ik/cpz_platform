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
      type: "object"
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
    }
  }
};

const SUB_VALIDATION_EVENT = {
  eventType: "Microsoft.EventGrid.SubscriptionValidationEvent"
};

export { BASE_EVENT, BASE_ERROR, SUB_VALIDATION_EVENT };
