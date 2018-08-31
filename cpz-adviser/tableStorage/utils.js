const { TableUtilities } = require("azure-storage");

const { entityGenerator } = TableUtilities;

function tryParseJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return false;
  }
  return false;
}
/**
 * Преобразовывает объект типа Azure Table Storage Entity в обычный объект JS
 *
 * @param {entity} entity
 * @returns {object}
 */
function entityToObject(entity) {
  const object = {};
  Object.keys(entity).forEach(key => {
    if (key === ".metadata") return;
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
      entity[key] = entityGenerator.String(JSON.stringify(element));
    } else if (typeof element === "number") {
      entity[key] = entityGenerator.Double(element);
    } else {
      entity[key] = entityGenerator.String(element);
    }
  });
  return entity;
}

module.exports = { entityToObject, objectToEntity };
