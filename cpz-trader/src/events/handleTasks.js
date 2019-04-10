import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/lib/dayjs";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { getTraderById } from "cpz/tableStorage-client/control/traders";
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
  const { taskId } = eventData;

  try {
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status && status.runtimeStatus === "Running") {
      Log.warn(`Trader "${taskId}" already started`);
      return;
    }
    let newTraderState = eventData;
    // Если есть предыдущее состояние трейдера
    const traderState = await getTraderById(taskId);
    if (traderState) {
      // Соедениям с текущим состоянием
      newTraderState = {
        ...traderState,
        ...newTraderState
      };
    }
    // Сохраняем новое задание трейдеру - старт
    await saveTraderAction({
      PartitionKey: taskId,
      RowKey: "TASK",
      id: uuid(),
      type: START,
      actionTime: dayjs.utc().valueOf()
    });
    // Запускаем новый оркестратор трейдера
    await client.startNew(ORCHESTRATOR, taskId, newTraderState);
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
  const { taskId } = eventData;
  try {
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status) {
      await saveTraderAction({
        PartitionKey: taskId,
        RowKey: "TASK",
        id: uuid(),
        type: STOP,
        actionTime: dayjs.utc().valueOf(),
        data: eventData
      });
      if (status.customStatus === READY) {
        await client.raiseEvent(taskId, TRADER_ACTION);
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
  const { taskId } = eventData;
  try {
    const client = df.getClient(context);
    const status = await client.getStatus(taskId);
    if (status) {
      await saveTraderAction({
        PartitionKey: taskId,
        RowKey: "TASK",
        id: uuid(),
        type: UPDATE,
        actionTime: dayjs.utc().valueOf(),
        data: eventData
      });
      if (status.customStatus === READY) {
        await client.raiseEvent(taskId, TRADER_ACTION);
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
