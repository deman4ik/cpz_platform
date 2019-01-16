import {
  startAdviserService,
  stopAdviserService,
  updateAdviserService
} from "./adviserService";
import {
  startBacktesterService,
  stopBacktesterService
} from "./backtesterService";
import {
  startCandlebatcherService,
  stopCandlebatcherService,
  updateCandlebatcherService
} from "./candlebatcherService";
import {
  startMarketwatcherService,
  stopMarketwatcherService,
  subscribeMarketwatcherService,
  unsubscribeMarketwatcherService
} from "./marketwatcherService";
import { startUserRobot, stopUserRobot, updateUserRobot } from "./userRobot";
import { startExWatcher, stopExWatcher, updateExWatcher } from "./exwatcher";
import {
  startTraderService,
  stopTraderService,
  updateTraderService
} from "./traderService";
import { startBacktest, stopBacktest } from "./backtest";

const mutations = {
  startAdviserService,
  stopAdviserService,
  updateAdviserService,
  startBacktest,
  stopBacktest,
  startBacktesterService,
  stopBacktesterService,
  startCandlebatcherService,
  stopCandlebatcherService,
  updateCandlebatcherService,
  startMarketwatcherService,
  stopMarketwatcherService,
  subscribeMarketwatcherService,
  unsubscribeMarketwatcherService,
  startExWatcher,
  stopExWatcher,
  updateExWatcher,
  startUserRobot,
  stopUserRobot,
  updateUserRobot,
  startTraderService,
  stopTraderService,
  updateTraderService
};

export default mutations;
