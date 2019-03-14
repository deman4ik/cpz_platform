const TABLES = {
  STORAGE_CURRENTPRICES_TABLE: "CurrentPrices"
};
/**
 * Get current market Price
 *
 * @param {string} slug
 */
const getCurrentPrice = async slug =>
  this.client.getEntityByKeys(TABLES.STORAGE_CURRENTPRICES_TABLE, {
    PartitionKey: slug,
    RowKey: slug
  });

/**
 * Save current market Price
 *
 * @param {number} price
 */
const saveCurrentPrice = async price =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_CURRENTPRICES_TABLE, price);

export { getCurrentPrice, saveCurrentPrice };
export default Object.values(TABLES);
