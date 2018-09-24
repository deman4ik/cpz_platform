const baseFields = [
  {
    name: "partitionKey",
    description:
      "Key of partition with format {Exchange}/{Asset}/{Currency}/[Timeframe] or {RobotId}",
    type: "string"
  },
  {
    name: "rowKey",
    description: "Uniq row key default {TaskId}",
    type: "string"
  },
  {
    name: "mode",
    description: "Current task mode.",
    type: "string",
    values: ["backtest", "emulator", "realtime"]
  },
  {
    name: "debug",
    description: "Debug mode flag.",
    type: "boolean"
  },
  {
    name: "status",
    description: "Current task status.",
    type: "string",
    values: ["pending", "started", "busy", "stopped", "error"]
  }
];

module.exports = { baseFields };
