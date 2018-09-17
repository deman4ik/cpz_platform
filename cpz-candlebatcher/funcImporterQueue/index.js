const handleQueue = require("../importer/handleQueue");

async function importerQueue(context, queueItem) {
  const keys = JSON.parse(queueItem);
  context.log.info(`Got Importers Next Queue data: ${keys}`);
  await handleQueue(context, keys);
}

module.exports = importerQueue;
