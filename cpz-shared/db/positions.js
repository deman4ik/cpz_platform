import VError from "verror";
import { chunkArray } from "../utils/helpers";

async function savePositions(data) {
  try {
    const query = `mutation insert_positions($objects: [cpz_positions_insert_input!]!){
      insert_cpz_positions(objects:$objects){
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
              objects: chunk.map(position => ({
                id: position.positionId,
                run_mode: position.mode,
                robot_id: position.robotId,
                user_id: position.userId,
                trader_id: position.traderId,
                exchange: position.exchange,
                asset: position.asset,
                currency: position.currency,
                timeframe: position.timeframe,
                status: position.status,
                code: position.options.code,
                // FIXME: direction: position.direction,
                entry_status: position.entry.status,
                entry_date: position.entry.date,
                entry_price: position.entry.price,
                // FIXME: entry_executed: position.entry.executed,
                exit_status: position.exit.status,
                exit_date: position.exit.date,
                exit_price: position.exit.price,
                // FIXME: exit_executed: position.exit.executed,
                slippage_step: position.settings.slippageStep,
                deviation: position.settings.deviation,
                quantity: position.settings.volume
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
      "Failed to save positions to DB"
    );
  }
}

export { savePositions };
