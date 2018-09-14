const { STORAGE_IMPORTERS_QUEUE } = require("../config");
const { createQueueIfNotExists, createMessage } = require("./storage");

async function queueImportIteration(context, message) {
  try {
    const queueCreated = await createQueueIfNotExists(STORAGE_IMPORTERS_QUEUE);

    if (!queueCreated.isSuccess)
      return { isSuccess: false, error: queueCreated };

    const messageCreated = await createMessage(
      STORAGE_IMPORTERS_QUEUE,
      JSON.stringify(message)
    );

    return messageCreated;
  } catch (error) {
    context.log(error);
    return { isSuccess: false, message, error };
  }
}

module.exports = { queueImportIteration };
