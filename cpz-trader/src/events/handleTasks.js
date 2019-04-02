import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/lib/dayjs";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { INTERNAL, FUNCTIONS } from "../config";

const {
  actions: { START, UPDATE, STOP },
  status: { READY },
  events: { TRADER_ACTION }
} = INTERNAL;
const { ORCHESTRATOR } = FUNCTIONS;

/**
 * Starting new Trader Orchestrator
 *
 * @param {object} context
 * @param {object} eventData
 */
async function handleStart(context, eventData) {
  Log.debug("handleStart", eventData);
  const { taskId } = eventData;

  try {
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status && status.runtimeStatus === "Running") {
      Log.warn(`Trader "${taskId}" already started`);
      return;
    }
    await saveTraderAction({
      PartitionKey: taskId,
      RowKey: "TASK",
      createdAt: dayjs.utc().toISOString(),
      id: uuid(),
      type: START
    });
    await client.startNew(ORCHESTRATOR, taskId, eventData);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_START_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Start Trader '$s'",
      taskId
    );
  }
}

/**
 * Stopping Trader Orchestrator
 *
 * @param {object} context
 * @param {object} eventData
 */
async function handleStop(context, eventData) {
  Log.debug("handleStop", eventData);
  const { taskId } = eventData;
  try {
    const action = { id: uuid(), type: STOP, data: eventData };
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status && status.runtimeStatus === "Running") {
      if (status.customStatus === READY) {
        await client.raiseEvent(taskId, TRADER_ACTION, action);
      } else {
        await saveTraderAction({
          PartitionKey: taskId,
          RowKey: "TASK",
          createdAt: dayjs.utc().toISOString(),
          ...action
        });
      }
    } else {
      Log.warn(`Trader "${taskId}" not started`);
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_STOP_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Stop Trader '$s'",
      taskId
    );
  }
}

/**
 * Updating Trader Orchestrator State
 *
 * @param {object} context
 * @param {object} eventData
 */
async function handleUpdate(context, eventData) {
  Log.debug("handleUpdate", eventData);
  const { taskId } = eventData;
  try {
    const action = { id: uuid(), type: UPDATE, data: eventData };
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status && status.runtimeStatus === "Running") {
      if (status.customStatus === READY) {
        await client.raiseEvent(taskId, TRADER_ACTION, action);
      } else {
        await saveTraderAction({
          PartitionKey: taskId,
          RowKey: "TASK",
          createdAt: dayjs.utc().toISOString(),
          ...action
        });
      }
    } else {
      throw Error(`Trader "${taskId}" not started`);
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_UPDATE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to Update Traders '$s' state",
      taskId
    );
  }
}

export { handleStart, handleStop, handleUpdate };
