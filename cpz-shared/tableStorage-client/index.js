import TableStorage from "./tableStorage";
import ServiceError from "../error";

/**
 * Base Table Storage Client
 */
class BaseTableStorageClient {
  constructor() {
    this.client = null; // Table Storage API Client
    this.tables = []; // Table Storage Tables List
  }

  addMethods(tables, methods) {
    this.tables = [...new Set([...this.tables, ...tables])];
    Object.keys(methods).forEach(key => {
      this[key] = methods[key];
    });
  }

  async createTablesIfNotExists() {
    if (!this.tables || !Array.isArray(this.tables) || this.tables.length === 0)
      throw new ServiceError(
        {
          name: ServiceError.types.TABLE_STORAGE_ERROR
        },
        "Wrong Table Storage tables list"
      );

    await Promise.all(
      this.tables.map(async table => {
        this.client.createTableIfNotExists(table);
      })
    );
  }

  async init(connectionString) {
    if (!connectionString)
      throw new ServiceError(
        {
          name: ServiceError.types.TABLE_STORAGE_CONFIG_ERROR
        },
        "Table Storage configuration error"
      );
    this.client = new TableStorage(connectionString);
    await this.createTablesIfNotExists();
  }
}

export default BaseTableStorageClient;
