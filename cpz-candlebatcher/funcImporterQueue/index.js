const handleQueue = require("../importer/handleQueue");

async function importerQueue(context, queueItem) {
  context.log.info(`Got Importers Next Queue data:`, queueItem);
  await handleQueue(context, queueItem);
}

module.exports = importerQueue;
