import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential
} from "@azure/storage-blob";
import { v4 as uuid } from "uuid";
import Log from "../log";
import ServiceError from "../error";
import { BLOB_LEASE_STATUS_UNLOCKED } from "../config/state/status";

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

  async delete(container, blobName) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      await blobURL.delete(Aborter.none);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_DELETE_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to delete blob %s",
        blobName
      );
    }
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

  async getProps(container, blobName) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      const props = await blobURL.getProperties();
      return props;
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_GETPROPS_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to get properties of blob %s",
        blobName
      );
    }
  }

  async getLeaseInfo(container, blobName) {
    try {
      const { leaseDuration, leaseState, leaseStatus } = await this.getProps(
        container,
        blobName
      );
      return { leaseDuration, leaseState, leaseStatus };
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_GETLEASEINFO_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to get lease info of blob %s",
        blobName
      );
    }
  }

  async acquireLease(container, blobName, seconds) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      const id = uuid();
      await blobURL.acquireLease(Aborter.none, id, seconds);
      return id;
    } catch (e) {
      if (e.body && e.body.Code && e.body.Code === "LeaseAlreadyPresent")
        return null;
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_ACQUIRELEASE_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to acquire lease on blob %s",
        blobName
      );
    }
  }

  async renewLease(container, blobName, leaseId) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      await blobURL.renewLease(Aborter.none, leaseId);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_RENEWLEASE_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to renew lease on blob %s",
        blobName
      );
    }
  }

  async releaseLease(container, blobName, leaseId) {
    try {
      const blobURL = BlobURL.fromContainerURL(
        this._containers[container],
        blobName
      );
      await blobURL.releaseLease(Aborter.none, leaseId);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_RELEASELEASE_ERROR,
          cause: e,
          info: { blobName }
        },
        "Failed to release lease on blob %s",
        blobName
      );
    }
  }

  async getUnlockedBlobsNames(container, blobNames) {
    try {
      const statuses = await Promise.all(
        blobNames.map(async blobName => {
          try {
            const { leaseStatus } = this.getLeaseInfo(container, blobName);
            return { blobName, leaseStatus };
          } catch (e) {
            Log.error(e);
            return { blobName, leaseStatus: null };
          }
        })
      );

      const unlocked = statuses
        .filter(status => status === BLOB_LEASE_STATUS_UNLOCKED)
        .map(status => status.blobName);

      return unlocked;
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.BLOB_STORAGE_BLOB_GETUNLOCKED_ERROR,
          cause: e
        },
        "Failed to get unlocked blobs"
      );
    }
  }
}
const client = new BlobStorageClient();

export default client;
