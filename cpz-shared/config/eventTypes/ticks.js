const TICKS_NEWTICK_EVENT = {
  eventType: "CPZ.Ticks.NewTick",

  dataSchema: {
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    side: {
      description: "Trade side.",
      type: "string",
      values: ["buy", "sell"]
    },
    tradeId: {
      description: "Trade ID.",
      type: "string",
      empty: false
    },
    time: { description: "Trade time in seconds.", type: "number" },
    volume: { description: "Trade Volume.", type: "number" },
    price: { description: "Trade Price.", type: "number" }
  }
};

const TICKS_HANDLED_EVENT = {
  eventType: "CPZ.Ticks.Handled",

  dataSchema: {
    tradeId: { description: "Uniq Trade Id.", type: "string", empty: false },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["trader"]
    },
    success: {
      description: "Success execution list",
      type: "array",
      items: "string"
    },
    error: {
      description: "Error execution list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: { type: "string", empty: false },
          error: {
            type: "object",
            description: "Error object if something goes wrong.",
            props: {
              code: {
                description: "Error code.",
                type: "string",
                empty: false
              },
              message: {
                description: "Error message.",
                type: "string",
                empty: false
              },
              detail: {
                description: "Error detail.",
                type: "string",
                optional: true,
                empty: false
              }
            },
            optional: true
          }
        }
      }
    }
  }
};
export { TICKS_NEWTICK_EVENT, TICKS_HANDLED_EVENT };