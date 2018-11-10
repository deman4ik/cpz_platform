import { getImporterByKey } from "../tableStorage";
import execute from "./execute";

async function handleQueue(context, keys) {
  const importerState = await getImporterByKey(keys);
  await execute(context, importerState);
  context.log.info(`Finished processing queue request: ${keys}`);
}

export default handleQueue;
