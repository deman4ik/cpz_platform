import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/lib/dayjs";
import { getIdledTradersWithActivePositions } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { CHECK, TRADER_IDLE_SECONDS } from "../config";

async function handleIdleTimer() {
  try {
    const traders = await getIdledTradersWithActivePositions(
      TRADER_IDLE_SECONDS
    );

    if (traders && traders.length > 0) {
      await Promise.all(
        traders.map(async ({ taskId }) => {
          try {
            await saveTraderAction({
              PartitionKey: taskId,
              RowKey: CHECK,
              id: uuid(),
              type: CHECK,
              actionTime: dayjs.utc().valueOf()
            });
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_IDLE_TIMER_ERROR,
                cause: e,
                info: { taskId }
              },
              `Failed to save check action for trader ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_IDLE_TIMER_ERROR,
        cause: e
      },
      "Failed to handle timer"
    );
  }
}

export default handleIdleTimer;
