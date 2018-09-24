const azure = require("azure-storage");
const { createTableIfNotExists, insertOrMergeEntity } = require("./storage");
const { objectToEntity, generateKey, createSlug } = require("./utils");
const { STORAGE_ALL_EVENTS_TABLE } = require("../config");

const { TableUtilities } = azure;
const { entityGenerator } = TableUtilities;

// Создать таблицы если не существуют
createTableIfNotExists(STORAGE_ALL_EVENTS_TABLE);

/**
 * Сохранение в таблицу AllEvents
 *
 * @param {*} context
 * @param {*} event
 * @returns
 */
async function saveToAllEvents(context, event) {
  try {
    const entity = {
      PartitionKey: entityGenerator.String(createSlug(event.eventType)),
      RowKey: entityGenerator.String(generateKey()),
      ...objectToEntity(event)
    };
    const entityUpdated = await insertOrMergeEntity(
      STORAGE_ALL_EVENTS_TABLE,
      entity
    );
    return { isSuccess: entityUpdated };
  } catch (error) {
    context.log(error);
    return { isSuccess: false, error };
  }
}

module.exports = {
  saveToAllEvents
};
