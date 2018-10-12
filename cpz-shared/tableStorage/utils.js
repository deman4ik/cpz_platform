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

export { entityToObject, objectToEntity, createAdviserSlug };