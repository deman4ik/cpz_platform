import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { ADVISER_LOCK } from "cpz/blobStorage/containers";
import { BLOB_LEASE_STATUS_UNLOCKED } from "cpz/config/state/status";
import { LOCK_PERIOD } from "../config";

async function createLockBlob(taskId) {
  try {
    await BlobStorageClient.upload(
      ADVISER_LOCK,
      `${taskId}.json`,
      JSON.stringify({
        taskId
      })
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_CREATE_LOCKFILE_ERROR,
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
    await BlobStorageClient.delete(ADVISER_LOCK, `${taskId}.json`);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_DEL_LOCKFILE_ERROR,
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
      ADVISER_LOCK,
      `${taskId}.json`,
      LOCK_PERIOD
    );
    return leaseId;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to lock adviser`
    );
    Log.error(error);
    return null;
  }
}

async function unlock(taskId, leaseId) {
  try {
    await BlobStorageClient.releaseLease(
      ADVISER_LOCK,
      `${taskId}.json`,
      leaseId
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock adviser`
    );
    Log.error(error);
    throw error;
  }
}

async function renewLock(taskId, leaseId) {
  try {
    await BlobStorageClient.renewLease(ADVISER_LOCK, `${taskId}.json`, leaseId);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock adviser`
    );
    Log.error(error);
    throw error;
  }
}

async function isUnlocked(taskId) {
  try {
    const { leaseStatus } = await BlobStorageClient.getLeaseInfo(
      ADVISER_LOCK,
      `${taskId}.json`
    );

    return leaseStatus === BLOB_LEASE_STATUS_UNLOCKED;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_CHECK_LOCKED_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to get adviser "%s" lease status`,
      taskId
    );
    Log.error(error);
    throw error;
  }
}

async function getUnlocked(advisers) {
  try {
    const unlockedadvisers = await BlobStorageClient.getUnlockedBlobsNames(
      ADVISER_LOCK,
      advisers
    );

    return unlockedadvisers;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_GET_UNLOCKED_ERROR,
        cause: e
      },
      `Failed to get unlocked advisers`
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
