import VError from "verror";
import { chunkArray } from "../utils/helpers";
import db from "./db";

function mapForDB(position) {
  return {
    id: position.positionId,
    robot_id: position.robotId,
    user_id: position.userId,
    trader_id: position.traderId,
    backtest_id: position.backtesterId,
    exchange: position.exchange,
    asset: position.asset,
    currency: position.currency,
    timeframe: position.timeframe,
    status: position.status,
    code: position.settings.positionCode,
    direction: position.direction,
    entry_date: position.entry.date,
    entry_price: position.entry.price,
    exit_date: position.exit.date,
    exit_price: position.exit.price,
    slippage_step: position.settings.slippageStep,
    deviation: position.settings.deviation,
    quantity: position.settings.volume
  };
}
async function savePositionsDB(data) {
  try {
    const query = `mutation insert_positions($objects: [cpz_positions_insert_input!]!) {
      insert_cpz_positions(
        objects: $objects
        on_conflict: {
          constraint: c_positions_uk
          update_columns: [status, exit_date, exit_price]
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
      "Failed to save positions to DB"
    );
  }
}

export { savePositionsDB };
