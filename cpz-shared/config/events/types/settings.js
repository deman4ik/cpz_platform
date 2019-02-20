const CANDLEBATCHER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  proxy: {
    description: "Proxy endpoint.",
    type: "string",
    optional: true,
    empty: false
  },
  requiredHistoryMaxBars: {
    description: "Load history data from cache.",
    type: "int",
    integer: true,
    optional: true
  }
};

const ADVISER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  strategyParameters: {
    description: "Strategy parameters.",
    type: "object",
    optional: true
  },
  requiredHistoryCache: {
    description: "Load history data from cache.",
    type: "boolean",
    optional: true,
    default: true
  },
  requiredHistoryMaxBars: {
    description: "Load history data from cache.",
    type: "int",
    integer: true,
    optional: true
  }
};

const KEY_VAULT_SECRET = {
  encryptionKeyName: {
    description: "Name of encryption key",
    type: "string"
  },
  name: {
    description: "Secret name",
    type: "string"
  },
  version: {
    description: "Secret version",
    type: "string"
  }
};
const TRADER_SETTINGS = {
  mode: {
    description: "Service run mode.",
    type: "tradeMode",
    values: ["emulator", "realtime"],
    requiredProps: {
      realtime: ["keys.main.APIKey", "keys.main.APISecret"]
    },
    optional: true
  },
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  slippageStep: {
    description: "Price Slippage Step.",
    type: "number",
    optional: true
  },
  deviation: {
    description: "Price deviation",
    type: "number",
    optional: true
  },
  volume: {
    description: "User trade volume",
    type: "number",
    optional: true
  },
  multiPosition: {
    description: "Multiple active positions available.",
    type: "boolean",
    optional: true
  },
  keys: {
    description: "Exchange API Keys Info",
    type: "object",
    props: {
      main: {
        description: "Main Exchange API Keys Info",
        type: "object",
        props: {
          APIKey: {
            description: "Main Exchange API Key",
            type: "object",
            props: KEY_VAULT_SECRET
          },
          APISecret: {
            description: "Main Exchange API Secret",
            type: "object",
            props: KEY_VAULT_SECRET
          }
        }
      },
      spare: {
        description: "Spare Exchange API Keys Info",
        type: "object",
        props: {
          APIKey: {
            description: "Spare Exchange API Key",
            type: "object",
            props: KEY_VAULT_SECRET
          },
          APISecret: {
            description: "Spare Exchange API Secret",
            type: "object",
            props: KEY_VAULT_SECRET
          }
        },
        optional: true
      }
    },
    optional: true
  }
};

const BACKTESTER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  }
};
export {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS,
  BACKTESTER_SETTINGS
};
