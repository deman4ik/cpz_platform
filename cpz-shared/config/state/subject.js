import { modeToStr } from "../../utils/helpers";

function createNewCandleSubject({
  exchange,
  asset,
  currency,
  timeframe,
  taskId,
  mode
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${taskId}.${modeToStr(
    mode
  )}`;
}

function createNewSignalSubject({
  exchange,
  asset,
  currency,
  timeframe,
  taskId,
  mode
}) {
  return createNewCandleSubject({
    exchange,
    asset,
    currency,
    timeframe,
    taskId,
    mode
  });
}

function createNewOrderSubject({
  exchange,
  asset,
  currency,
  timeframe,
  traderId,
  mode
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${traderId}.${modeToStr(
    mode
  )}`;
}

export {
  createNewCandleSubject,
  createNewSignalSubject,
  createNewOrderSubject
};
