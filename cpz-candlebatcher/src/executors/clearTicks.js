import Log from "cpz/log";
import ServiceError from "cpz/error";
import { createCachedTickSlug } from "cpz/config/state";
import { deletePrevCachedTicks } from "cpz/tableStorage-client/market/ticks";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function clearTicks(state) {
  try {
    const { exchange, asset, currency, dateTo } = state;
    await deletePrevCachedTicks({
      slug: createCachedTickSlug({
        exchange,
        asset,
        currency
      }),
      dateTo
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
