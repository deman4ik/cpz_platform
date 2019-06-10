import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { TRADER_LOCK } from "cpz/blobStorage/containers";
import { BLOB_LEASE_STATUS_UNLOCKED } from "cpz/config/state/status";
import { LOCK_PERIOD } from "../config";

async function createLockBlob(taskId) {
  try {
    await BlobStorageClient.upload(
      TRADER_LOCK,
      `${taskId}.json`,
      JSON.stringify({
        taskId
      })
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_CREATE_LOCKFILE_ERROR,
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
    await BlobStorageClient.delete(TRADER_LOCK, `${taskId}.json`);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_DEL_LOCKFILE_ERROR,
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
      TRADER_LOCK,
      `${taskId}.json`,
      LOCK_PERIOD
    );
    return leaseId;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_LOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to lock trader`
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
      TRADER_LOCK,
      `${taskId}.json`,
      leaseId
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock trader`
    );
    Log.error(error);
  }
}

async function renewLock(taskId, leaseId) {
  try {
    const unlocked = await isUnlocked(taskId);
    if (unlocked) return await lock(taskId);
    await BlobStorageClient.renewLease(TRADER_LOCK, `${taskId}.json`, leaseId);
    return leaseId;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_UNLOCK_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to unlock trader`
    );
    Log.error(error);
    const newLeaseId = await lock(taskId);
    return newLeaseId;
  }
}

async function isUnlocked(taskId) {
  try {
    const { leaseStatus } = await BlobStorageClient.getLeaseInfo(
      TRADER_LOCK,
      `${taskId}.json`
    );

    return leaseStatus === BLOB_LEASE_STATUS_UNLOCKED;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_CHECK_LOCKED_ERROR,
        cause: e,
        info: {
          taskId
        }
      },
      `Failed to get trader "%s" lease status`,
      taskId
    );
    Log.error(error);
    throw error;
  }
}

async function getUnlocked(traders) {
  try {
    const unlockedtraders = await BlobStorageClient.getUnlockedBlobsNames(
      TRADER_LOCK,
      traders
    );

    return unlockedtraders;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_GET_UNLOCKED_ERROR,
        cause: e
      },
      `Failed to get unlocked traders`
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
