import { GraphQLClient } from "graphql-request";

import { saveCandles, getCandles, countCandles } from "./candles";
import { saveTasksEvent } from "./tasksEvents";
import { saveSignals } from "./signals";
import { saveOrders } from "./orders";
import { savePositions } from "./positions";
import { saveLogEvent } from "./logsEvents";
import { saveErrorEvent } from "./errorsEvents";
import { getUserRobot } from "./userRobots";
import { isBacktestExists, saveBacktests, deleteBacktest } from "./backtests";

class DataBaseAPI {
  constructor() {
    const { DB_API_ENDPOINT, DB_API_ACCESS_KEY } = process.env;
    this.client = new GraphQLClient(DB_API_ENDPOINT, {
      headers: {
        "X-Hasura-Access-Key": `${DB_API_ACCESS_KEY}`
        // TODO: Authorization
      }
    });

    this.saveCandles = saveCandles;
    this.getCandles = getCandles;
    this.countCandles = countCandles;

    this.getUserRobot = getUserRobot;

    this.saveTasksEvent = saveTasksEvent;
    this.saveSignals = saveSignals;
    this.saveOrders = saveOrders;
    this.savePositions = savePositions;
    this.saveLogEvent = saveLogEvent;
    this.saveErrorEvent = saveErrorEvent;

    this.saveBacktests = saveBacktests;
    this.isBacktestExists = isBacktestExists;
    this.deleteBacktest = deleteBacktest;
  }
}

export default DataBaseAPI;
