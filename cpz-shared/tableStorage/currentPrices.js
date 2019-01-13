import { STORAGE_CURRENTPRICES_TABLE } from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_CURRENTPRICES_TABLE);

const getCurrentPrice = async slug =>
  tableStorage.getEntityByKeys(STORAGE_CURRENTPRICES_TABLE, {
    PartitionKey: slug,
    RowKey: slug
  });

const saveCurrentPrice = async price =>
  tableStorage.insertOrMergeEntity(STORAGE_CURRENTPRICES_TABLE, price);

export { getCurrentPrice, saveCurrentPrice };
