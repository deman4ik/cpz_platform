import { BASE_EVENTS } from "./base";
import CANDLES_EVENTS from "./candles";
import SIGNALS_EVENTS from "./signals";
import TICKS_EVENTS from "./ticks";
import TRADES_EVENTS from "./trades";
import TASKS_ADVISER_EVENTS from "./tasks/adviser";
import TASKS_BACKTEST_EVENTS from "./tasks/backtest";
import TASKS_BACKTESTER_EVENTS from "./tasks/backtester";
import TASKS_CANDLEBATCHER_EVENTS from "./tasks/candlebatcher";
import TASKS_EXWATCHER_EVENTS from "./tasks/exwatcher";
import TASKS_IMPORTER_EVENTS from "./tasks/importer";
import TASKS_MARKETWATCHER_EVENTS from "./tasks/marketwatcher";
import TASKS_TRADER_EVENTS from "./tasks/trader";
import TASKS_USERROBOT_EVENTS from "./tasks/userRobot";

export default {
  ...BASE_EVENTS,
  ...CANDLES_EVENTS,
  ...SIGNALS_EVENTS,
  ...TICKS_EVENTS,
  ...TRADES_EVENTS,
  ...TASKS_ADVISER_EVENTS,
  ...TASKS_BACKTEST_EVENTS,
  ...TASKS_BACKTESTER_EVENTS,
  ...TASKS_CANDLEBATCHER_EVENTS,
  ...TASKS_EXWATCHER_EVENTS,
  ...TASKS_IMPORTER_EVENTS,
  ...TASKS_MARKETWATCHER_EVENTS,
  ...TASKS_TRADER_EVENTS,
  ...TASKS_USERROBOT_EVENTS
};
