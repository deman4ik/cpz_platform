import VError from "verror";
import { chunkArray } from "../utils/helpers";

function mapForDB(order) {
  return {
    id: order.orderId,
    position_id: order.positionId,
    user_id: order.userId,
    robot_id: order.robotId,
    exchange: order.exchange,
    asset: order.asset,
    currency: order.currency,
    timeframe: order.timeframe,
    created_at: order.createdAt,
    order_type: order.orderType,
    // TODO: order_time: order.ex.time,
    // TODO: order_num order.ex.id,
    status: order.status,
    action: order.action,
    price: order.price,
    exec_quantity: order.executed,
    signal_id: order.signalId,
    candle_timestamp: order.candleTimestamp
  };
}
async function saveOrders(data) {
  try {
    const query = `mutation insert_orders($objects: [cpz_trades_insert_input!]!){
      insert_cpz_trades(objects:$objects
        on_conflict: {
          constraint: c_trades_pk
          update_columns: [status, price, exec_quantity]
        }
        ){
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

            await this.client.request(query, variables);
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

export { saveOrders };
