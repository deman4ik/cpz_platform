import { cpz } from "../types/cpz";
import { CANDLES_RECENT_AMOUNT } from "../config";

function combineRobotSettings({
  strategyParameters,
  requiredHistoryMaxBars,
  volume
}: cpz.RobotSettings): cpz.RobotSettings {
  return {
    strategyParameters: strategyParameters || {},
    requiredHistoryMaxBars: requiredHistoryMaxBars || CANDLES_RECENT_AMOUNT,
    volume: volume || 1
  };
}

export { combineRobotSettings };
