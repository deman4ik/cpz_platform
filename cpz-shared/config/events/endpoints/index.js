import adviser from "./adviser";
import backtester from "./backtester";
import candlebatcher from "./candlebatcher";
import control from "./control";
import eventslogger from "./eventslogger";
import importer from "./importer";
import marketwatcher from "./marketwatcher";
import trader from "./trader";
import {
  TASKS_TOPIC,
  CANDLES_TOPIC,
  TICKS_TOPIC,
  SIGNALS_TOPIC,
  TRADES_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC
} from "./topics";

const endpoints = {
  ...adviser,
  ...backtester,
  ...candlebatcher,
  ...control,
  ...eventslogger,
  ...importer,
  ...marketwatcher,
  ...trader
};
const topics = [
  TASKS_TOPIC,
  CANDLES_TOPIC,
  TICKS_TOPIC,
  SIGNALS_TOPIC,
  TRADES_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC
];
export { endpoints, topics };
