import VError from "verror";
import { chunkArray } from "../utils/helpers";
import db from "./db";

function mapForDB(order) {
  return {
    id: order.orderId, // internal order id
    position_id: order.positionId, // internal position id
    user_id: order.userId,
    robot_id: order.robotId,
    exchange: order.exchange,
    asset: order.asset,
    currency: order.currency,
    timeframe: order.timeframe,
    created_at: order.createdAt, // time of issuing order inside the system
    status: order.status,
    action: order.action,
    order_type: order.orderType,
    order_time: order.exTimestamp, // time of posting order to exchange
    order_ex_num: order.exId, // external order number from Exchange
    order_price: order.price, // price of asset to send to exchange including slippage, comes from robot settings
    order_quantity: order.volume, // quantity (volume) of asset to trade, comes from robot settings
    exec_time: order.exLastTrade, // time of execution order inside an exchange
    exec_price: order.average, // order price from Exchange = "average price"
    exec_quantity: order.executed, // quantity (volume) of asset in the order has been executed on Exchange
    remain_quantity: order.remaining, // quantity (volume) of asset remaining to execute to exchange, = 0 if all of order_quantity is executed
    signal_id: order.signalId,
    backtest_id: order.backtesterId,
    trader_id: order.traderId,
    candle_timestamp: order.candleTimestamp
  };
}
async function saveOrdersDB(data) {
  try {
    const query = `mutation insert_orders($objects: [cpz_orders_insert_input!]!) {
      insert_cpz_orders(
        objects: $objects
        on_conflict: {
          constraint: c_orders_pk
          update_columns: [
            status
            exec_price
            exec_quantity
            exec_time
            order_ex_num
            order_price
            order_time
            remain_quantity
          ]
        }
      ) {
        affected_rows
      }
    }`;

    if (data && data.length > 0) {
      const chunks = chunkArray(data, 100);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const chunk of chunks) {
        if (chunk.length > 0) {
          try {
            const variables = {
              objects: chunk.map(order => mapForDB(order))
            };

            await db.request(query, variables);
          } catch (error) {
            throw error;
          }
        }
      }
    }
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error
      },
      "Failed to save orders to DB"
    );
  }
}

export { saveOrdersDB };
