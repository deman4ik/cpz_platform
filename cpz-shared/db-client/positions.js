import ServiceError from "../error";
import DB from "./index";
import { chunkArray } from "../utils/helpers";

function mapPositionsDataForDB(position) {
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

function mapPositionsWLDataForDB(position) {
  return {
    id: position.id,
    code: position.code,
    type: position.type,
    entry_date: position.entryDate,
    entry_price: position.entryPrice,
    entry_signal: position.entrySignal,
    entry_order_type: position.entryOrderType,
    entry_bar: position.entryBar,
    exit_date: position.exitDate,
    exit_price: position.exitPrice,
    exit_signal: position.exitSignal,
    exit_order_type: position.exitOrderType,
    exit_bar: position.exitBar,
    backtest_id: position.backtestId
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
              objects: chunk.map(position => mapPositionsDataForDB(position))
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

async function savePositionsWLDB(data) {
  try {
    const query = `mutation insert_positions_wl($objects: [cpz_backtest_positions_wl_insert_input!]!) {
      insert_cpz_backtest_positions_wl(
        objects: $objects
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
              objects: chunk.map(position => mapPositionsWLDataForDB(position))
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
      "Failed to save positions WL to DB"
    );
  }
}
export { savePositionsDB, savePositionsWLDB };
