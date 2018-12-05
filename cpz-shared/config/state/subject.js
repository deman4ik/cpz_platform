import { modeToStr } from "../../utils/helpers";

function createMarketwatcherTaskSubject({ exchange, mode }) {
  return `${exchange}/${modeToStr(mode)}`;
}

function createCandlebatcherTaskSubject({ exchange, asset, currency, mode }) {
  return `${exchange}/${asset}/${currency}/${modeToStr(mode)}`;
}

function createAdviserTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  mode
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${modeToStr(
    mode
  )}`;
}

function createTraderTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  mode
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${modeToStr(
    mode
  )}`;
}

function createBacktesterTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  userId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${userId}/B}`;
}

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
  createMarketwatcherTaskSubject,
  createCandlebatcherTaskSubject,
  createAdviserTaskSubject,
  createTraderTaskSubject,
  createBacktesterTaskSubject,
  createNewCandleSubject,
  createNewSignalSubject,
  createNewOrderSubject
};
