import ServiceError from "../error";
import DB from "./index";
import { chunkArray } from "../utils/helpers";

function mapForDB(position) {
  return {
    id: position.id,
    code: position.code,
    run_mode: position.mode,
    backtest_id: position.backtesterId,
    trader_id: position.traderId,
    robot_id: position.robotId,
    user_id: position.userId,
    exchange: position.exchange,
    asset: position.asset,
    currency: position.currency,
    timeframe: position.timeframe,
    status: position.status,
    direction: position.direction,
    entry_date: position.entry.date,
    entry_price: position.entry.price,
    exit_date: position.exit.date,
    exit_price: position.exit.price,
    quantity: position.executed,
    reason: position.reason
  };
}
async function savePositionsDB(data) {
  try {
    const query = `mutation insert_positions($objects: [cpz_positions_insert_input!]!) {
      insert_cpz_positions(
        objects: $objects
        on_conflict: {
          constraint: c_positions_pk
          update_columns: [status, entry_date, entry_price, exit_date, exit_price, quantity, reason]
        }
      ) {
        affected_rows
      }
    }
    `;

    if (data && data.length > 0) {
      const chunks = chunkArray(data, 100);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const chunk of chunks) {
        if (chunk.length > 0) {
          try {
            const variables = {
              objects: chunk.map(position => mapForDB(position))
            };

            await DB.client.request(query, variables);
          } catch (error) {
            throw error;
          }
        }
      }
    }
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save positions to DB"
    );
  }
}
export { savePositionsDB };
