import VError from "verror";
import { STORAGE_IMPORTERS_QUEUE } from "cpzQueuesList";
import { createQueueIfNotExists, createMessage } from "cpzQueue/storage";

createQueueIfNotExists(STORAGE_IMPORTERS_QUEUE);

async function queueImportIteration(message) {
  try {
    await createMessage(STORAGE_IMPORTERS_QUEUE, JSON.stringify(message));
  } catch (error) {
    throw new VError(
      {
        name: "ImporterQueueError",
        cause: error,
        info: {
          message
        }
      },
      "Failed to save import iteration to queue"
    );
  }
}

export { queueImportIteration };
