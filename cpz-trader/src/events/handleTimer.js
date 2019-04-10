import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/lib/dayjs";
import { getIdledTradersWithActivePositions } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { INTERNAL } from "../config";

const {
  traderIdleMinutes,
  actions: { CHECK },
  events: { TRADER_ACTION },
  status: { READY }
} = INTERNAL;

async function handleTimer(context) {
  try {
    // TODO: Check TraderActions
    const traders = await getIdledTradersWithActivePositions(traderIdleMinutes);

    if (traders && traders.length > 0) {
      const client = df.getClient(context);
      await Promise.all(
        traders.map(async ({ taskId }) => {
          const status = await client.getStatus(taskId);
          Log.warn(status.runtimeStatus, status.customStatus);
          if (status) {
            await saveTraderAction({
              PartitionKey: taskId,
              RowKey: CHECK,
              id: uuid(),
              type: CHECK,
              actionTime: dayjs.utc().valueOf()
            });
            if (status.customStatus === READY) {
              await client.raiseEvent(taskId, TRADER_ACTION);
            }
          } else {
            Log.error(`Trader "${taskId}" not started`);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_TIMER_ERROR,
        cause: e
      },
      "Failed to handle timer"
    );
  }
}

export default handleTimer;
