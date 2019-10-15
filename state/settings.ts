import { cpz } from "../@types";
import { CANDLES_RECENT_AMOUNT } from "../config";

function combineRobotSettings({
  strategyParameters,
  requiredHistoryMaxBars,
  volume
}: cpz.RobotSettings = {}): cpz.RobotSettings {
  return {
    strategyParameters: strategyParameters || {},
    requiredHistoryMaxBars: requiredHistoryMaxBars || CANDLES_RECENT_AMOUNT,
    volume: volume || 1
  };
}

function combineBacktestSettings({
  local,
  populateHistory
}: cpz.BacktesterSettings = {}): cpz.BacktesterSettings {
  return {
    local: local === undefined || local === null ? false : local,
    populateHistory:
      populateHistory === undefined || populateHistory === null
        ? false
        : populateHistory
  };
}

export { combineRobotSettings, combineBacktestSettings };
