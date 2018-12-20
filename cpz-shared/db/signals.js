import VError from "verror";
import { chunkArray } from "../utils/helpers";

async function saveSignals(data) {
  try {
    const query = `mutation insert_signals($objects: [cpz_signal_insert_input!]!){
      insert_cpz_signal(objects:$objects){
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
              objects: chunk.map(signal => ({
                id: signal.signalId,
                robot_id: signal.robotId,
                backtest_id: signal.backtesterId,
                adviser_id: signal.adviserId,
                alert_time: signal.timestamp,
                action: signal.action,
                price: signal.price,
                order_type: signal.orderType,
                price_source: signal.priceSource,
                candle: signal.candle,
                params: signal.settings,
                position_id: signal.positionId,
                candle_id: signal.candleId,
                candle_timestamp: signal.candleTimestamp
              }))
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
      "Failed to save signals to DB"
    );
  }
}

export { saveSignals };
