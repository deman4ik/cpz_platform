const baseFields = {
  partitionKey: {
    name: "partitionKey",
    description:
      "Key of partition with format {Exchange}/{Asset}/{Currency}/[Timeframe] or {RobotId}",
    type: "string"
  },
  rowKey: {
    name: "rowKey",
    description: "Uniq row key default {TaskId}",
    type: "string"
  },
  mode: {
    name: "mode",
    description: "Current task mode.",
    type: "string",
    values: ["backtest", "emulator", "realtime"]
  },
  debug: {
    name: "debug",
    description: "Debug mode flag.",
    type: "boolean"
  },
  status: {
    name: "status",
    description: "Current task status.",
    type: "string",
    values: ["pending", "started", "busy", "stopped", "error"]
  }
};

export { baseFields };
