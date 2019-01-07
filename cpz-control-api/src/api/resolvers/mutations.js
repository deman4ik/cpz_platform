import { startAdviser, stopAdviser, updateAdviser } from "./adviser";
import { startBacktester, stopBacktester } from "./backtester";
import {
  startCandlebatcher,
  stopCandlebatcher,
  updateCandlebatcher
} from "./candlebatcher";
import {
  startMarketwatcher,
  stopMarketwatcher,
  subscribeMarketwatcher,
  unsubscribeMarketwatcher
} from "./marketwatcher";
import { startRobot, stopRobot, updateRobot } from "./robot";
import { startExWatcher, stopExWatcher, updateExWatcher } from "./exwatcher";
import { startTrader, stopTrader, updateTrader } from "./trader";

const mutations = {
  startAdviser,
  stopAdviser,
  updateAdviser,
  startBacktester,
  stopBacktester,
  startCandlebatcher,
  stopCandlebatcher,
  updateCandlebatcher,
  startMarketwatcher,
  stopMarketwatcher,
  subscribeMarketwatcher,
  unsubscribeMarketwatcher,
  startExWatcher,
  stopExWatcher,
  updateExWatcher,
  startRobot,
  stopRobot,
  updateRobot,
  startTrader,
  stopTrader,
  updateTrader
};

export default mutations;
