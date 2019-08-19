import { cpz } from "../types/cpz";
import { CANDLES_RECENT_AMOUNT } from "../config";

function combineRobotSettings({
  strategyParameters,
  requiredHistoryMaxBars
}: cpz.RobotSettings): cpz.RobotSettings {
  return {
    strategyParameters: strategyParameters || {},
    requiredHistoryMaxBars: requiredHistoryMaxBars || CANDLES_RECENT_AMOUNT
  };
}

export { combineRobotSettings };
