import { GraphQLClient } from "graphql-request";
import * as balance from "./balance";
import * as candles from "./candles";
import * as market from "./market";
import * as orders from "./orders";
import * as trades from "./trades";

class ConnectorClient {
  constructor() {
    this.client = null;
    this.getBalance = balance.getBalanceEX.bind(this);
    this.lastMinuteCandle = candles.lastMinuteCandleEX.bind(this);
    this.minuteCandles = candles.minuteCandlesEX.bind(this);
    this.market = market.marketEX.bind(this);
    this.createOrder = orders.createOrderEX.bind(this);
    this.cancelOrder = orders.cancelOrderEX.bind(this);
    this.checkOrder = orders.checkOrderEX.bind(this);
    this.trades = trades.tradesEX.bind(this);
  }

  init({ endpoint, key }) {
    if (!endpoint || !key)
      throw new Error("Invalid connector client credentials");
    this.client = new GraphQLClient(endpoint, {
      headers: {
        "api-key": key
        // TODO: Authorization
      }
    });
  }
}
const client = new ConnectorClient();
export default client;
