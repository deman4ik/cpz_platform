import client from "./index";

const TABLES = {
  STORAGE_EXCHANGE_ORDERS_TABLE: "ExchangeOrders"
};

const getExchangeOrder = async ({ PartitionKey, RowKey }) =>
  client.getEntityByKeys(TABLES.STORAGE_EXCHANGE_ORDERS_TABLE, {
    RowKey,
    PartitionKey
  });

const saveExchangeOrder = async order =>
  client.insertOrMergeEntity(TABLES.STORAGE_EXCHANGE_ORDERS_TABLE, order);

export { getExchangeOrder, saveExchangeOrder };
export default Object.values(TABLES);
