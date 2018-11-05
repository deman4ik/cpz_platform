import { getImporterByKey } from "../tableStorage";
import execute from "./execute";

async function handleQueue(context, keys) {
  const getImporterResult = await getImporterByKey(context, keys);
  if (!getImporterResult.isSuccess) {
    throw getImporterResult;
  }
  const importerState = getImporterResult.data;
  await execute(context, importerState);
  context.log.info(`Finished processing queue request: ${keys}`);
}

export default handleQueue;
