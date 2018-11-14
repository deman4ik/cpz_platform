// TODO: Move to https://github.com/Azure/azure-storage-js when available
import azure from "azure-storage";
import VError from "verror";
import { entityToObject } from "./utils";

const tableService = azure
  .createTableService(process.env.AZ_STORAGE_CS)
  .withFilter(new azure.LinearRetryPolicyFilter(3, 2000));
/**
 * Создание таблицы если еще не существует
 *
 * @param {*} tableName
 * @returns
 */
function createTableIfNotExists(tableName) {
  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(tableName, (error, result) => {
      if (error) {
        reject(
          new VError(
            {
              name: error.name,
              cause: error,
              info: {
                tableName
              }
            },
            'Failed to create table "%s"',
            tableName
          )
        );
      }

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
      if (error) {
        let err;
        if (error.code === "UpdateConditionNotSatisfied") {
          err = new VError(
            {
              name: "StorageEntityMutation",
              cause: error,
              info: {
                tableName,
                entity
              }
            },
            'Entity mutation in "%s"',
            tableName
          );
        } else {
          err = new VError(
            {
              name: error.name,
              cause: error,
              info: {
                tableName,
                entity
              }
            },
            'Failed to insert or merge entity in "%s"',
            tableName
          );
        }
        reject(err);
      }
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
      if (error) {
        let err;
        if (error.code === "UpdateConditionNotSatisfied") {
          err = new VError(
            {
              name: "StorageEntityMutation",
              cause: error,
              info: {
                tableName,
                entity
              }
            },
            'Entity mutation in "%s"',
            tableName
          );
        } else {
          err = new VError(
            {
              name: error.name,
              cause: error,
              info: {
                tableName,
                entity
              }
            },
            'Failed to merge entity in "%s"',
            tableName
          );
        }
        reject(err);
      }
      resolve(true);
    });
  });
}

/**
 * Удаление записи из таблицы
 *
 * @param {*} tableName
 * @param {*} entity
 * @returns
 */
function deleteEntity(tableName, entity) {
  return new Promise((resolve, reject) => {
    tableService.deleteEntity(tableName, entity, error => {
      if (error)
        reject(
          new VError(
            {
              name: error.name,
              cause: error,
              info: {
                tableName,
                entity
              }
            },
            'Failed to delete entity from "%s"',
            tableName
          )
        );
      resolve(true);
    });
  });
}

/**
 * Выполнение группы задач
 *
 * @param {*} tableName
 * @param {*} batch
 */
function executeBatch(tableName, batch) {
  return new Promise((resolve, reject) => {
    tableService.executeBatch(tableName, batch, error => {
      if (error)
        reject(
          new VError(
            {
              name: error.name,
              cause: error,
              info: {
                tableName,
                batch
              }
            },
            'Failed to execute batch operations in "%s"',
            tableName
          )
        );
      resolve(true);
    });
  });
}

function query(tableName, tableQuery, continuationToken) {
  return new Promise((resolve, reject) => {
    tableService.queryEntities(
      tableName,
      tableQuery,
      continuationToken,
      (error, result) => {
        if (error)
          reject(
            new VError(
              {
                name: error.name,
                cause: error,
                info: {
                  tableName,
                  tableQuery
                }
              },
              'Failed to query entities from "%s"',
              tableName
            )
          );

        const res = { data: [], continuationToken: null };
        if (result) {
          result.entries.forEach(element => {
            res.data.push(entityToObject(element));
          });
          if (result.continuationToken) {
            res.continuationToken = result.continuationToken;
          }
        }

        resolve(res);
      }
    );
  });
}
/**
 * Выборка данных из таблицы
 *
 * @param {*} tableName
 * @param {*} tableQuery
 * @returns
 */
async function queryEntities(tableName, tableQuery) {
  let entities = [];
  let nextContinuationToken = null;
  do {
    /* eslint-disable no-await-in-loop */
    const { data, continuationToken } = await query(
      tableName,
      tableQuery,
      nextContinuationToken
    );
    /* no-wait-in-loop */
    entities = entities.concat(data);
    nextContinuationToken = continuationToken;
  } while (nextContinuationToken);
  return entities;
}
export {
  createTableIfNotExists,
  insertOrMergeEntity,
  mergeEntity,
  deleteEntity,
  executeBatch,
  queryEntities
};
