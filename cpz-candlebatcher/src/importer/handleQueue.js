import { getImporterById } from "cpzStorage";
import execute from "./execute";

async function handleQueue(context, { taskId }) {
  const importerState = await getImporterById(taskId);
  await execute(context, importerState);
  context.log.info(`Finished processing queue request: ${taskId}`);
}

export default handleQueue;
