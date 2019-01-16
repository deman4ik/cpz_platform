function createExWatcherTaskSubject({ exchange, asset, currency }) {
  return `${exchange}/${asset}/${currency}`;
}

function createCandlebatcherTaskSubject({ exchange, asset, currency }) {
  return `${exchange}/${asset}/${currency}`;
}

function createAdviserTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}`;
}

function createTraderTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  userId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${userId}`;
}

function createBacktestTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  userId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${userId}`;
}

function createBacktesterTaskSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  userId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${userId}`;
}

function createNewCandleSubject({ exchange, asset, currency, timeframe }) {
  return `${exchange}/${asset}/${currency}/${timeframe}`;
}

function createNewSignalSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}`;
}

function createNewTradeSubject({
  exchange,
  asset,
  currency,
  timeframe,
  robotId,
  userId
}) {
  return `${exchange}/${asset}/${currency}/${timeframe}/${robotId}/${userId}`;
}

export {
  createExWatcherTaskSubject,
  createCandlebatcherTaskSubject,
  createAdviserTaskSubject,
  createTraderTaskSubject,
  createBacktestTaskSubject,
  createBacktesterTaskSubject,
  createNewCandleSubject,
  createNewSignalSubject,
  createNewTradeSubject
};
