import adviser from "./adviser";
import backtester from "./backtester";
import candlebatcher from "./candlebatcher";
import control from "./control";
import eventslogger from "./eventslogger";
import importer from "./importer";
import marketwatcher from "./marketwatcher";
import trader from "./trader";

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
export default endpoints;
