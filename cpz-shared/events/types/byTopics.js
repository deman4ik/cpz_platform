import * as topics from "../topics";
import * as tasks from "./tasks";
import * as candles from "./candles";
import * as error from "./error";
import * as log from "./log";
import * as signals from "./signals";
import * as ticks from "./ticks";
import * as trades from "./trades";

export default {
  [topics.TASKS_TOPIC]: [...Object.keys(tasks).map(key => tasks[key])],
  [topics.CANDLES_TOPIC]: [...Object.keys(candles).map(key => candles[key])],
  [topics.ERROR_TOPIC]: [...Object.keys(error).map(key => error[key])],
  [topics.LOG_TOPIC]: [...Object.keys(log).map(key => log[key])],
  [topics.SIGNALS_TOPIC]: [...Object.keys(signals).map(key => signals[key])],
  [topics.TICKS_TOPIC]: [...Object.keys(ticks).map(key => ticks[key])],
  [topics.TRADES_TOPIC]: [...Object.keys(trades).map(key => trades[key])]
};
