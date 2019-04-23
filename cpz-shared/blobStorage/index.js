import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential
} from "@azure/storage-blob";
import ServiceError from "../error";

class BlobStorageClient {
  constructor() {
    this._serviceURL = null;
    this._containers = {};
  }

  async _createContainer(container) {
    try {
      await this._containers[container].create(Aborter.none);
    } catch (e) {
      if (e.body && e.body.Code && e.body.Code === "ContainerAlreadyExists")
        return;
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_CONTAINER_CREATE_ERROR,
          cause: e,
          info: { container }
        },
        "Failed to create BLOB Container %s",
        container
      );
    }
  }

  async init(storageAccountName, storageAccountKey, containers) {
    const sharedKeyCredential = new SharedKeyCredential(
      storageAccountName,
      storageAccountKey
    );
    const pipeline = StorageURL.newPipeline(sharedKeyCredential);
    this._serviceURL = new ServiceURL(
      `https://${storageAccountName}.blob.core.windows.net`,
      pipeline
    );

    await Promise.all(
      containers.map(async container => {
        this._containers[container] = ContainerURL.fromServiceURL(
          this._serviceURL,
          container
        );
        await this._createContainer(container);
      })
    );
  }

  async _streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", data => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }

  async upload(container, blobName, content) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
      await blockBlobURL.upload(Aborter.none, content, content.length);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_UPLOAD_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to upload blob %s",
        blobName
      );
    }
  }

  async download(container, blobName) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      const downloadBlockBlobResponse = await blobURL.download(Aborter.none, 0);
      const string = await this._streamToString(
        downloadBlockBlobResponse.readableStreamBody
      );
      return string;
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_DOWNLOAD_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to download blob %s",
        blobName
      );
    }
  }
}
const client = new BlobStorageClient();

export default client;
