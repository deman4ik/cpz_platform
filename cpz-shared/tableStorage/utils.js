import { TableUtilities } from "azure-storage";
import { tryParseJSON } from "../utils/helpers";

const { entityGenerator } = TableUtilities;

/**
 * Преобразовывает объект типа Azure Table Storage Entity в обычный объект JS
 *
 * @param {entity} entity
 * @returns {object}
 */
function entityToObject(entity) {
  const object = {};
  Object.keys(entity).forEach(key => {
    if (key === ".metadata") {
      object.metadata = entity[".metadata"];
    }
    const json = tryParseJSON(entity[key]._);
    if (json) {
      object[key] = json;
    } else {
      object[key] = entity[key]._;
    }
  });
  return object;
}
/**
 * Преобразовывает обычный объект JS в объект типа Azure Table Storage Entity
 *
 * @param {object} object
 * @returns {entity}
 */
function objectToEntity(object) {
  const entity = {};
  Object.keys(object).forEach(key => {
    const element = object[key];

    if (typeof element === "object") {
      if (key === "metadata") {
        entity[".metadata"] = element;
      } else if (element instanceof Date) {
        entity[key] = entityGenerator.DateTime(element);
      } else {
        entity[key] = entityGenerator.String(JSON.stringify(element));
      }
    } else if (key === "timestamp") {
      entity[key] = entityGenerator.DateTime(element);
    } else if (typeof element === "number") {
      entity[key] = entityGenerator.Double(element);
    } else if (typeof element === "boolean") {
      entity[key] = entityGenerator.Boolean(element);
    } else {
      entity[key] = entityGenerator.String(element);
    }
  });
  return entity;
}

function createMarketwatcherSlug(hostId, modeStr = "R") {
  if (modeStr === "R") return hostId;
  return `${hostId}.${modeStr}`;
}

function createCandlebatcherSlug(exchange, asset, currency, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${modeStr}`;
}

function createCachedTickSlug(exchange, asset, currency, modeStr = "R") {
  if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
  return `${exchange}.${asset}.${currency}.${modeStr}`;
}

// TODO: генерация ID свечей -   exchange,asset,currencyбtimeframe,modeStr,time
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
  entityToObject,
  objectToEntity,
  createMarketwatcherSlug,
  createCandlebatcherSlug,
  createCachedTickSlug,
  createCachedCandleSlug,
  createAdviserSlug,
  createTraderSlug,
  createBacktesterSlug
};
