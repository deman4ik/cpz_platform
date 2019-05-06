import { startUserRobot, stopUserRobot, updateUserRobot } from "./userRobot";
import { startExWatcher, stopExWatcher } from "./exwatcher";
import { startBacktest, stopBacktest } from "./backtest";
import { startImporter, stopImporter } from "./importer";
import {
  pauseAdvisers,
  pauseCandlebatchers,
  pauseTraders,
  resumeAdvisers,
  resumeCandlebatchers,
  resumeTraders
} from "./suspense";

const mutations = {
  startBacktest,
  stopBacktest,
  startImporter,
  stopImporter,
  startExWatcher,
  stopExWatcher,
  startUserRobot,
  stopUserRobot,
  updateUserRobot,
  pauseAdvisers,
  pauseCandlebatchers,
  pauseTraders,
  resumeAdvisers,
  resumeCandlebatchers,
  resumeTraders
};

export default mutations;
