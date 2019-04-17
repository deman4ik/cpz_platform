import { startUserRobot, stopUserRobot, updateUserRobot } from "./userRobot";
import { startExWatcher, stopExWatcher } from "./exwatcher";
import { startBacktest, stopBacktest } from "./backtest";
import { startImporter, stopImporter } from "./importer";

const mutations = {
  startBacktest,
  stopBacktest,
  startImporter,
  stopImporter,
  startExWatcher,
  stopExWatcher,
  startUserRobot,
  stopUserRobot,
  updateUserRobot
};

export default mutations;
