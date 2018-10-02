// TODO: Move to https://github.com/Azure/azure-storage-js when available
const azure = require("azure-storage");

const tableService = azure.createTableService(process.env.AZ_STORAGE_CS);
/**
 * Создание таблицы если еще не существует
 *
 * @param {*} tableName
 * @returns
 */
function createTableIfNotExists(tableName) {
  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(tableName, (error, result) => {
      if (error) reject(error);

      resolve(result);
    });
  });
}
/**
 * Добавление или обновление записи в таблице
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */
function insertOrMergeEntity(tableName, entity) {
  return new Promise((resolve, reject) => {
    tableService.insertOrMergeEntity(tableName, entity, error => {
      if (error) reject(error);
      resolve(true);
    });
  });
}

/**
 * Обновление записи в таблице
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */
function mergeEntity(tableName, entity) {
  return new Promise((resolve, reject) => {
    tableService.mergeEntity(tableName, entity, error => {
      if (error) reject(error);
      resolve(true);
    });
  });
}

/**
 * Удаление записи в таблице
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */
function deleteEntity(tableName, entity) {
  return new Promise((resolve, reject) => {
    tableService.deleteEntity(tableName, entity, error => {
      if (error) reject(error);
      resolve(true);
    });
  });
}

/**
 * Выборка данных из таблицы
 *
 * @param {*} tableName
 * @param {*} tableQuery
 * @returns
 */
function queryEntities(tableName, tableQuery) {
  return new Promise((resolve, reject) => {
    tableService.queryEntities(tableName, tableQuery, null, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}
module.exports = {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  queryEntities
};
