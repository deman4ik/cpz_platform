import ServiceError from "../../error";
import client from "./index";
import { maxArrOfObj } from "../../utils/helpers";

const TABLES = {
  STORAGE_CURRENTPRICES_TABLE: "CurrentPrices"
};
/**
 * Get current market Price
 *
 * @param {string} slug
 */
const getCurrentPrice = async slug => {
  try {
    const prices = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_CURRENTPRICES_TABLE,
      {
        PartitionKey: slug,
        RowKey: slug
      }
    );
    if (prices && prices.length > 0) {
      return maxArrOfObj(prices, "time");
    }
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug }
      },
      'Failed to read current price by slug "%s"',
      slug
    );
  }
};
/**
 * Save current market Price
 *
 * @param {number} price
 */
const saveCurrentPrice = async price =>
  client.insertOrMergeEntity(TABLES.STORAGE_CURRENTPRICES_TABLE, price);

export { getCurrentPrice, saveCurrentPrice };
export default Object.values(TABLES);
