import { TRADER_SERVICE } from "cpz/config/services";

const SERVICE_NAME = TRADER_SERVICE;
const TRADER_IDLE_SECONDS = 30;
const START = "start";
const STOP = "stop";
const UPDATE = "update";
const PAUSE = "pause";
const TASK = "TASK";
const SIGNAL = "handleSignal";
const PRICE = "checkPrice";
const CHECK = "checkOrders";
const LOCK_PERIOD = 50;
export {
  SERVICE_NAME,
  TRADER_IDLE_SECONDS,
  START,
  STOP,
  UPDATE,
  PAUSE,
  TASK,
  SIGNAL,
  PRICE,
  CHECK,
  LOCK_PERIOD
};
