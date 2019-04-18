import { TRADER_SERVICE } from "cpz/config/services";

const SERVICE_NAME = TRADER_SERVICE;
const TRADER_IDLE_SECONDS = 30;
const START = "start";
const STOP = "stop";
const UPDATE = "update";
const TASK = "TASK";
const SIGNAL = "handleSignal";
const PRICE = "checkPrice";
const CHECK = "checkOrders";

export {
  SERVICE_NAME,
  TRADER_IDLE_SECONDS,
  START,
  STOP,
  UPDATE,
  TASK,
  SIGNAL,
  PRICE,
  CHECK
};
