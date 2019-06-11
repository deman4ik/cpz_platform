import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { CANDLEBATCHER_LOCK } from "cpz/blobStorage/containers";
import { BLOB_LEASE_STATUS_UNLOCKED } from "cpz/config/state/status";
import { LOCK_PERIOD } from "../config";

async function createLockBlob(taskId) {
  try {
    await BlobStorageClient.upload(
      CANDLEBATCHER_LOCK,
      `${taskId}.json`,
      JSON.stringify({
        taskId
      })
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CREATE_LOCKFILE_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to create lock file`
    );
    Log.error(error);
    throw error;
  }
}

async function deleteLockBlob(taskId) {
  try {
    await BlobStorageClient.delete(CANDLEBATCHER_LOCK, `${taskId}.json`);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_DEL_LOCKFILE_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to delete lock file`
    );
    Log.error(error);
    throw error;
  }
}

async function lock(taskId) {
  try {
    const leaseId = await BlobStorageClient.acquireLease(
      CANDLEBATCHER_LOCK,
      `${taskId}.json`,
      LOCK_PERIOD
    );
    return leaseId;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_LOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to lock candlebatcher`
    );
    Log.error(error);
    return null;
  }
}

async function unlock(taskId, leaseId) {
  try {
    const unlocked = await isUnlocked(taskId);
    if (unlocked) return;
    await BlobStorageClient.releaseLease(
      CANDLEBATCHER_LOCK,
      `${taskId}.json`,
      leaseId
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock candlebatcher`
    );
    Log.error(error);
  }
}

async function renewLock(taskId, leaseId) {
  try {
    const unlocked = await isUnlocked(taskId);
    if (unlocked) return await lock(taskId);
    await BlobStorageClient.renewLease(
      CANDLEBATCHER_LOCK,
      `${taskId}.json`,
      leaseId
    );
    return leaseId;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock candlebatcher`
    );
    Log.error(error);
    const newLeaseId = await lock(taskId);
    return newLeaseId;
  }
}

async function isUnlocked(taskId) {
  try {
    const { leaseStatus } = await BlobStorageClient.getLeaseInfo(
      CANDLEBATCHER_LOCK,
      `${taskId}.json`
    );

    return leaseStatus === BLOB_LEASE_STATUS_UNLOCKED;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CHECK_LOCKED_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to get candlebatcher "%s" lease status`,
      taskId
    );
    Log.error(error);
    throw error;
  }
}

async function getUnlocked(candlebatchers) {
  try {
    const unlockedCandlebatchers = await BlobStorageClient.getUnlockedBlobsNames(
      CANDLEBATCHER_LOCK,
      candlebatchers
    );

    return unlockedCandlebatchers;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_GET_UNLOCKED_ERROR,
        cause: e
      },
      `Failed to get unlocked candlebatchers`
    );
    Log.error(error);
    throw error;
  }
}

export {
  createLockBlob,
  deleteLockBlob,
  lock,
  unlock,
  renewLock,
  isUnlocked,
  getUnlocked
};
