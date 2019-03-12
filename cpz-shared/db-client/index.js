import { GraphQLClient } from "graphql-request";
import * as backtests from "./backtests";
import * as candles from "./candles";
import * as orders from "./orders";
import * as positions from "./positions";
import * as robots from "./robots";
import * as signals from "./signals";
import * as userRobotHist from "./userRobotHist";
import * as userRobots from "./userRobots";

class DB {
  constructor({ endpoint, key }) {
    if (!endpoint || !key) throw new Error("Invalid db client credentials");
    this.client = new GraphQLClient(endpoint, {
      headers: {
        "X-Hasura-Access-Key": key
        // TODO: Authorization
      }
    });

    this.isBacktestExists = backtests.isBacktestExistsDB.bind(this);
    this.saveBacktests = backtests.saveBacktestsDB.bind(this);
    this.deleteBacktest = backtests.deleteBacktestDB.bind(this);
    this.saveCandles = candles.saveCandlesDB.bind(this);
    this.getCandles = candles.getCandlesDB.bind(this);
    this.countCandles = candles.countCandlesDB.bind(this);
    this.saveOrders = orders.saveOrdersDB.bind(this);
    this.savePositions = positions.savePositionsDB.bind(this);
    this.getRobot = robots.getRobotDB.bind(this);
    this.saveSignals = signals.saveSignalsDB.bind(this);
    this.saveUserRobotHist = userRobotHist.saveUserRobotHistDB.bind(this);
    this.getUserRobot = userRobots.getUserRobotDB.bind(this);
  }
}

export default DB;
