import { ADVISER_SERVICE } from "cpzServices";
import Log from "cpzLog";
import { checkEnvVars } from "cpzUtils/environment";
import adviserEnv from "cpzEnv/adviser";
import taskEvents from "./funcs/funcTaskEvents";
import candleEvents from "./funcs/funcCandleEvents";

class AdviserService {
  constructor() {
    console.log("constructor start");
    this.candleEvents = candleEvents;
    this.taskEvents = taskEvents;
    this.init();
    console.log("constructor end");
    // this.db = new DB();
  }

  init() {
    console.log("init start");
    checkEnvVars(adviserEnv.variables);
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: ADVISER_SERVICE
    });
    console.log("init end");
  }
}
const service = new AdviserService();
export default service;
