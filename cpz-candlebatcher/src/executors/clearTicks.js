import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";
import { createCachedTickSlug } from "cpz/config/state";
import { deletePrevCachedTicks } from "cpz/tableStorage-client/market/ticks";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function clearTicks(state, time) {
  try {
    const { exchange, asset, currency } = state;
    await deletePrevCachedTicks({
      slug: createCachedTickSlug({
        exchange,
        asset,
        currency
      }),
      dateTo: dayjs
        .utc(time)
        .endOf("minute")
        .toISOString()
    });
    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CLEAR_TICKS_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      "Failed to clear ticks"
    );
    Log.exception(error);
    return false;
  }
}

export default clearTicks;
