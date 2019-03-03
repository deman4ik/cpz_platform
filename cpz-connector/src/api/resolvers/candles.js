import Log from "cpzUtils/log";
import { getPublicConnector } from "../../global";

async function loadLastMinuteCandle(
  _,
  { connectorInput, date, asset, currency },
  { context }
) {
  Log.debug({ userId: "D" }, "loadLastMinuteCandle()");
  Log.event({ method: "loadLastMinuteCandle" });
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadLastMinuteCandle(context, {
    date,
    asset,
    currency
  });
  return result;
}

async function loadMinuteCandles(
  _,
  { connectorInput, date, limit, asset, currency },
  { context }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadMinuteCandles(context, {
    date,
    limit,
    asset,
    currency
  });
  return result;
}

export { loadLastMinuteCandle, loadMinuteCandles };
