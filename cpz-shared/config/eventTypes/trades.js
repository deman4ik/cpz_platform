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

    orderId: { description: "Uniq Order Id.", type: "string", empty: false },
    signalId: { description: "Uniq Single Id.", type: "string", empty: false },
    orderType: {
      description: "Order type.",
      type: "string",
      values: ["stop", "limit", "market"],
      empty: false,
      optional: true
    },
    price: {
      description: "Price in quote currency.",
      type: "number",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number",
      empty: false
    },
    createdAt: {
      description: "Order created timestamp in UTC.",
      type: "datetime",
      empty: false
    },
    status: {
      description: "Order status.",
      type: "string",
      values: ["none", "opened", "posted", "closed", "canceled", "error"],
      empty: false
    },
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
      values: ["long", "closeLong", "short", "closeShort"],
      empty: false
    },
    executed: {
      description: "Executed volume.",
      type: "number",
      optional: true
    }
  }
};

const TRADES_POSITION_EVENT = {
  eventType: "CPZ.Trades.Position",

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
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    status: {
      description: "Position status.",
      type: "string",
      values: ["none", "opened", "closed", "canceled", "error"],
      empty: false
    },
    entryStatus: {
      description: "Position entry status.",
      type: "string",
      values: ["none", "opened", "posted", "closed", "canceled", "error"],
      empty: false
    },
    exitStatus: {
      description: "Position exit status.",
      type: "string",
      values: ["none", "opened", "posted", "closed", "canceled", "error"],
      empty: false
    },
    entryPrice: {
      description: "Position entry price in quote currency.",
      type: "number",
      empty: false
    },
    exitPrice: {
      description: "Position exit price in quote currency.",
      type: "number",
      empty: false
    },
    entryDate: {
      description: "Position entry timestamp in UTC.",
      type: "datetime",
      empty: false
    },
    exitDate: {
      description: "Position exit timestamp in UTC.",
      type: "datetime",
      empty: false
    }
  }
};

export { TRADES_ORDER_EVENT, TRADES_POSITION_EVENT };
