function createCandlebatcherSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

function createImporterSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

function createCachedTickSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

function createCachedCandleSlug({ exchange, asset, currency, timeframe }) {
  return `${exchange}.${asset}.${currency}.${timeframe}`;
}

function createAdviserSlug({ exchange, asset, currency, timeframe }) {
  return `${exchange}.${asset}.${currency}.${timeframe}`;
}

function createTraderSlug({ exchange, asset, currency, timeframe, robotId }) {
  return `${exchange}.${asset}.${currency}.${timeframe}.${robotId}`;
}

function createPositionSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

function createBacktesterSlug({
  exchange,
  asset,
  currency,
  timeframe,
  robotId
}) {
  return `${exchange}.${asset}.${currency}.${timeframe}.${robotId}`;
}

function createBacktestSlug({ exchange, asset, currency, timeframe, robotId }) {
  return `${exchange}.${asset}.${currency}.${timeframe}.${robotId}`;
}

function createRobotSlug({ exchange, asset, currency, robotId }) {
  return `${exchange}.${asset}.${currency}.${robotId}`;
}

function createWatcherSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

function createCurrentPriceSlug({ exchange, asset, currency }) {
  return `${exchange}.${asset}.${currency}`;
}

export {
  createAdviserSlug,
  createBacktesterSlug,
  createBacktestSlug,
  createCachedCandleSlug,
  createCachedTickSlug,
  createCandlebatcherSlug,
  createImporterSlug,
  createTraderSlug,
  createPositionSlug,
  createRobotSlug,
  createWatcherSlug,
  createCurrentPriceSlug
};
