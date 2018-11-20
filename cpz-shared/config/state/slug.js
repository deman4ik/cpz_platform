function createMarketwatcherSlug(hostId, modeStr = "R") {
  if (modeStr === "R") return hostId;
  return `${hostId}.${modeStr}`;
}

function createCandlebatcherSlug(exchange, asset, currency, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${modeStr}`;
}

function createImporterSlug(exchange, asset, currency, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${modeStr}`;
}

function createCachedTickSlug(exchange, asset, currency, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${modeStr}`;
}

function createCachedCandleSlug(
  exchange,
  asset,
  currency,
  timeframe,
  modeStr = "R"
) {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
}

function createAdviserSlug(
  exchange,
  asset,
  currency,
  timeframe,
  modeStr = "R"
) {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
}

function createTraderSlug(exchange, asset, currency, timeframe, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
}

function createBacktesterSlug(exchange, asset, currency, timeframe, robotId) {
  return `${exchange}.${asset}.${currency}.${timeframe}.${robotId}`;
}

export {
  createAdviserSlug,
  createBacktesterSlug,
  createCachedCandleSlug,
  createCachedTickSlug,
  createCandlebatcherSlug,
  createImporterSlug,
  createMarketwatcherSlug,
  createTraderSlug
};
