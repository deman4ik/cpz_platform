const TRADES_ORDER_EVENT = {
  eventType: "CPZ.Trades.Order",

  dataSchema: {
    positionId: {
      description: "Uniq Position Id.",
      type: "string",
      empty: false
    },
    traderId: { description: "Uniq Trader Id.", type: "string", empty: false },
    robotId: {
      description: "Robot uniq Id.",
      type: "string",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },

    orderId: { description: "Uniq Candle Id.", type: "string", empty: false },
    signalId: { description: "Uniq Single Id.", type: "string", empty: false },
    orderType: {
      description: "Order type.",
      type: "string",
      values: ["stop", "limit", "market"],
      optional: true
    },
    price: {
      description: "Price in quote currency.",
      type: "number"
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    createdAt: {
      description: "Order created timestamp in UTC.",
      type: "datetime",
      empty: false
    },
    status: { description: "Order status.", type: "string", empty: false },
    direction: {
      description: "Order direction.",
      type: "string",
      empty: false
    },
    positionDirection: {
      description: "Order position direction.",
      type: "string",
      empty: false
    },
    action: {
      description: "Signal type.",
      type: "string",
      values: ["long", "closeLong", "short", "closeShort"]
    },
    executed: {
      description: "Executed volume.",
      type: "number",
      optional: true
    }
  }
};

export { TRADES_ORDER_EVENT };
