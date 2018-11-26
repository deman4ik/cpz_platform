import { modeToStr } from "../../utils/helpers";

function createMarketwatcherSlug({ hostId, mode, modeStr }) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return hostId;
  return `${hostId}.${_modeStr}`;
}

function createCandlebatcherSlug({ exchange, asset, currency, mode, modeStr }) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${_modeStr}`;
}

function createImporterSlug({ exchange, asset, currency, mode, modeStr }) {
  return createCandlebatcherSlug({ exchange, asset, currency, mode, modeStr });
}

function createCachedTickSlug({ exchange, asset, currency, mode, modeStr }) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${_modeStr}`;
}

function createCachedCandleSlug({
  exchange,
  asset,
  currency,
  timeframe,
  mode,
  modeStr
}) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${_modeStr}`;
}

function createAdviserSlug({
  exchange,
  asset,
  currency,
  timeframe,
  mode,
  modeStr
}) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${_modeStr}`;
}

function createTraderSlug({
  exchange,
  asset,
  currency,
  timeframe,
  mode,
  modeStr
}) {
  const _modeStr = modeStr || modeToStr(mode);
  if (_modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
  return `${exchange}.${asset}.${currency}.${timeframe}.${_modeStr}`;
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

export {
  modeToStr,
  createAdviserSlug,
  createBacktesterSlug,
  createCachedCandleSlug,
  createCachedTickSlug,
  createCandlebatcherSlug,
  createImporterSlug,
  createMarketwatcherSlug,
  createTraderSlug
};
