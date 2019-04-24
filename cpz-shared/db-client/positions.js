import ServiceError from "../error";
import DB from "./index";
import { chunkArray } from "../utils/helpers";

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
    quantity: position.settings.volume,
    run_mode: position.settings.mode
  };
}
async function savePositionsDB(data) {
  try {
    const query = `mutation insert_positions($objects: [cpz_positions_insert_input!]!) {
      insert_cpz_positions(
        objects: $objects
        on_conflict: {
          constraint: c_positions_pk
          update_columns: [status, entry_date, entry_price, exit_date, exit_price]
        }
      ) {
        affected_rows
      }
    }
    `;
    const errors = [];
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
            errors.push(error);
          }
        }
      }
    }
    if (errors.length > 0)
      throw new ServiceError(
        {
          name: ServiceError.types.DB_ERROR,
          cause: errors[0],
          info: {
            errors
          }
        },
        "Failed to save positions to DB"
      );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save positions to DB"
    );
  }
}
function mapEventForDB(position) {
  return {
    id: position.id,
    code: position.code,
    run_mode: position.mode,
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
async function saveEventPositionsDB(data) {
  try {
    const query = `mutation insert_positions($objects: [cpz_positions_insert_input!]!) {
      insert_cpz_positions(
        objects: $objects
        on_conflict: {
          constraint: c_positions_pk
          update_columns: [status, entry_date, entry_price, exit_date, exit_price]
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
              objects: chunk.map(position => mapEventForDB(position))
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
export { savePositionsDB, saveEventPositionsDB };
