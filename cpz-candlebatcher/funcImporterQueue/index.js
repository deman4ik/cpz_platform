const handleQueue = require("../importer/handleQueue");

async function importerQueue(context, queueItem) {
  const keys = JSON.parse(queueItem);

  await handleQueue(context, keys);
}

module.exports = importerQueue;
