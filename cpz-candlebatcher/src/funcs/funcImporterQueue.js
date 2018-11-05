import "babel-polyfill";
import handleQueue from "../importer/handleQueue";

async function importerQueue(context, queueItem) {
  context.log.info(`Got Importers Next Queue data:`, queueItem);
  await handleQueue(context, queueItem);
}

export default importerQueue;
