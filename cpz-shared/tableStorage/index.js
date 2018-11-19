// TODO: Move to https://github.com/Azure/azure-storage-js when available
import azure from "azure-storage";
import VError from "verror";
import { tryParseJSON } from "../utils/helpers";

const { entityGenerator } = azure.TableUtilities;

/**
 * Azure Table Storage API and helpers
 */
class TableStorage {
  constructor() {
    this._tableService = azure
      .createTableService(process.env.AZ_STORAGE_CS)
      .withFilter(new azure.LinearRetryPolicyFilter(3, 2000));
  }

  /**
   * Преобразовывает объект типа Azure Table Storage Entity в обычный объект JS
   *
   * @param {entity} entity
   * @returns {object}
   */
  entityToObject(entity) {
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
  objectToEntity(object) {
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

  createMarketwatcherSlug(hostId, modeStr = "R") {
    if (modeStr === "R") return hostId;
    return `${hostId}.${modeStr}`;
  }

  createCandlebatcherSlug(exchange, asset, currency, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
    return `${exchange}.${asset}.${currency}.${modeStr}`;
  }

  createImporterSlug(exchange, asset, currency, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
    return `${exchange}.${asset}.${currency}.${modeStr}`;
  }

  createCachedTickSlug(exchange, asset, currency, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}`;
    return `${exchange}.${asset}.${currency}.${modeStr}`;
  }

  createCachedCandleSlug(exchange, asset, currency, timeframe, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
    return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
  }

  createAdviserSlug(exchange, asset, currency, timeframe, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
    return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
  }

  createTraderSlug(exchange, asset, currency, timeframe, modeStr = "R") {
    if (modeStr === "R") return `${exchange}.${asset}.${currency}.${timeframe}`;
    return `${exchange}.${asset}.${currency}.${timeframe}.${modeStr}`;
  }

  createBacktesterSlug(exchange, asset, currency, timeframe, robotId) {
    return `${exchange}.${asset}.${currency}.${timeframe}.${robotId}`;
  }

  /**
   * Создание таблицы если еще не существует
   *
   * @param {*} tableName
   * @returns
   */
  createTableIfNotExists(tableName) {
    return new Promise((resolve, reject) => {
      this._tableService.createTableIfNotExists(tableName, (error, result) => {
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
  insertOrMergeEntity(tableName, entity) {
    return new Promise((resolve, reject) => {
      this._tableService.insertOrMergeEntity(tableName, entity, error => {
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
  mergeEntity(tableName, entity) {
    return new Promise((resolve, reject) => {
      this._tableService.mergeEntity(tableName, entity, error => {
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
  deleteEntity(tableName, entity) {
    return new Promise((resolve, reject) => {
      this._tableService.deleteEntity(tableName, entity, error => {
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
  executeBatch(tableName, batch) {
    return new Promise((resolve, reject) => {
      this._tableService.executeBatch(tableName, batch, error => {
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

  _query(tableName, tableQuery, continuationToken) {
    return new Promise((resolve, reject) => {
      this._tableService.queryEntities(
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
              res.data.push(this.entityToObject(element));
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
  async queryEntities(tableName, tableQuery) {
    let entities = [];
    let nextContinuationToken = null;
    do {
      /* eslint-disable no-await-in-loop */
      const { data, continuationToken } = await this._query(
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
}

const tableStorage = new TableStorage();
export default tableStorage;
