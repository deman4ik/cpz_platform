import azure from "azure-storage";

const queueService = azure.createQueueService(process.env.AzureWebJobsStorage);
queueService.messageEncoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder();

function createQueueIfNotExists(queueName) {
  return new Promise((resolve, reject) => {
    queueService.createQueueIfNotExists(queueName, error => {
      if (error) reject(error);
      resolve({ success: true });
    });
  });
}

function createMessage(queueName, message) {
  return new Promise((resolve, reject) => {
    queueService.createMessage(queueName, message, (error, result) => {
      if (error) reject(error);
      resolve({ success: true, messageResult: result });
    });
  });
}

function getMessages(queueName) {
  return new Promise((resolve, reject) => {
    queueService.getMessages(queueName, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}

function deleteMessage(queueName, messageId, popReceipt) {
  return new Promise((resolve, reject) => {
    queueService.deleteMessage(
      queueName,
      messageId,
      popReceipt,
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      }
    );
  });
}

export { createQueueIfNotExists, createMessage, getMessages, deleteMessage };
