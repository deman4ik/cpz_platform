// TODO: Move to https://github.com/Azure/azure-storage-js when available
import azure from "azure-storage";
import VError from "verror";
import { tryParseJSON, chunkArray } from "../utils/helpers";

const { TableQuery, TableUtilities } = azure;
const { entityGenerator } = TableUtilities;
const tableService = azure
  .createTableService(process.env.AZ_STORAGE_CS)
  .withFilter(new azure.LinearRetryPolicyFilter(3, 2000));
/**
 * Azure Table Storage API and helpers
 */
class TableStorage {
  /**
   * Convert object type Azure Table Storage Entity to common JS Object
   *
   * @param {entity} entity
   * @returns {Object}
   */
  static entityToObject(entity) {
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
   * Convert common JS Object to Azure Table Storage Entity object type
   *
   * @param {Object} object
   * @returns {entity}
   */
  static objectToEntity(object) {
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

  /**
   * Create table if not exists
   *
   * @param {string} tableName
   * @returns
   */
  static createTableIfNotExists(tableName) {
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
   * Insert or merge entity
   *
   * @param {string} tableName
   * @param {Object} data
   * @returns
   */
  static insertOrMergeEntity(tableName, data) {
    return new Promise((resolve, reject) => {
      const entity = this.objectToEntity(data);
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
   * Insert or merge array of entities
   *
   * @param {string} table
   * @param {object[]} array
   */
  static async insertOrMergeArray(table, array) {
    try {
      const chunks = chunkArray(array, 100);
      await Promise.all(
        chunks.map(async chunk => {
          const batch = new azure.TableBatch();
          chunk.forEach(entity => {
            batch.insertOrMergeEntity(this.objectToEntity(entity));
          });
          await this.executeBatch(table, batch);
        })
      );
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error
        },
        'Failed to save array to "%s"',
        table
      );
    }
  }

  /**
   * Merge entity
   *
   * @param {string} tableName
   * @param {Object} data
   * @returns
   */
  static mergeEntity(tableName, data) {
    return new Promise((resolve, reject) => {
      const entity = this.objectToEntity(data);
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
   * Delete entity
   *
   * @param {string} tableName
   * @param {Object} data
   * @returns
   *
   */
  static deleteEntity(tableName, data) {
    return new Promise((resolve, reject) => {
      const entity = this.objectToEntity(data);
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
   * Delete array of entities
   *
   * @param {string} table
   * @param {Object[]} array
   */
  static async deleteArray(table, array) {
    try {
      const chunks = chunkArray(array, 100);
      await Promise.all(
        chunks.map(async chunk => {
          const batch = new azure.TableBatch();
          chunk.forEach(entity => {
            batch.deleteEntity(this.objectToEntity(entity));
          });
          await this.executeBatch(table, batch);
        })
      );
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error
        },
        'Failed to save array to "%s"',
        table
      );
    }
  }

  /**
   * Execute batch of table storage commands
   *
   * @param {string} tableName
   * @param {Batch} batch
   */
  static executeBatch(tableName, batch) {
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

  /**
   * Query
   *
   * @param {string} tableName
   * @param {TableQuery} tableQuery
   * @param {TableContinuationToken} continuationToken
   * @returns {entity[]}
   */
  static _query(tableName, tableQuery, continuationToken) {
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
   * Query entities
   *
   * @param {string} tableName
   * @param {TableQuery} tableQuery
   * @returns {entity[]}
   */
  static async queryEntities(tableName, tableQuery) {
    try {
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
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            tableName
          }
        },
        'Failed to read from "%s"',
        tableName
      );
    }
  }

  /**
   * Count entities
   *
   * @param {string} tableName
   * @param {TableQuery} tableQuery
   * @returns {int} - entities count
   */
  static async countEntities(tableName, tableQuery) {
    try {
      let entitiesCount = 0;
      let nextContinuationToken = null;
      do {
        /* eslint-disable no-await-in-loop */
        const { data, continuationToken } = await this._query(
          tableName,
          tableQuery,
          nextContinuationToken
        );
        /* no-wait-in-loop */
        entitiesCount += data.length;
        nextContinuationToken = continuationToken;
      } while (nextContinuationToken);
      return entitiesCount;
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            tableName
          }
        },
        'Failed to count entities in "%s"',
        tableName
      );
    }
  }

  /**
   * Query entities by Row Key
   *
   * @param {string} table
   * @param {string} RowKey
   * @returns {entity}
   */
  static async getEntityByRowKey(table, RowKey) {
    try {
      const rowKeyFilter = TableQuery.stringFilter(
        "RowKey",
        TableUtilities.QueryComparisons.EQUAL,
        RowKey
      );
      const query = new TableQuery().where(rowKeyFilter);
      return await this.queryEntities(table, query)[0];
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            table,
            RowKey
          }
        },
        'Failed to read from "%s" RowKey: "%s"',
        table,
        RowKey
      );
    }
  }

  /**
   * Query entities by Partition Key
   *
   * @param {string} table
   * @param {string} PartitionKey
   * @returns {entity[]}
   */
  static async getEntitiesByPartitionKey(table, PartitionKey) {
    try {
      const partitionKeyFilter = TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        PartitionKey
      );
      const query = new TableQuery().where(partitionKeyFilter);
      return await this.queryEntities(table, query)[0];
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            table,
            PartitionKey
          }
        },
        'Failed to read from "%s" PartitionKey: "%s"',
        table,
        PartitionKey
      );
    }
  }

  /**
   * Query entity by Partition Key
   *
   * @param {string} table
   * @param {string} PartitionKey
   * @returns {entity}
   */
  static async getEntityByPartitionKey(table, PartitionKey) {
    try {
      const entities = await this.getEntitiesByPartitionKey(
        table,
        PartitionKey
      );
      return entities[0];
    } catch (error) {
      if (error instanceof VError) throw error;
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            table,
            PartitionKey
          }
        },
        'Failed to read from "%s" PartitionKey: "%s"',
        table,
        PartitionKey
      );
    }
  }

  /**
   * Query entity by Row Key and Partition Key
   *
   * @param {string} table
   * @param {Object} input
   * @param {string} input.RowKey
   * @param {string} input.PartitionKey
   * @returns {entity}
   */
  static async getEntityByKeys(table, { RowKey, PartitionKey }) {
    try {
      const rowKeyFilter = TableQuery.stringFilter(
        "RowKey",
        TableUtilities.QueryComparisons.EQUAL,
        RowKey
      );
      const partitionKeyFilter = TableQuery.stringFilter(
        "PartitionKey",
        TableUtilities.QueryComparisons.EQUAL,
        PartitionKey
      );
      const query = new TableQuery().where(
        TableQuery.combineFilters(
          rowKeyFilter,
          TableUtilities.TableOperators.AND,
          partitionKeyFilter
        )
      );
      return await this.queryEntities(table, query)[0];
    } catch (error) {
      throw new VError(
        {
          name: "TableStorageError",
          cause: error,
          info: {
            table,
            RowKey,
            PartitionKey
          }
        },
        'Failed to read from "%s" by keys "%s", "%s"',
        table,
        PartitionKey,
        RowKey
      );
    }
  }
}

export default TableStorage;