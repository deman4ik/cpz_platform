import { CANDLEBATCHER_SERVICE } from "cpz/config/services";

const SERVICE_NAME = CANDLEBATCHER_SERVICE;
const START = "start";
const STOP = "stop";
const UPDATE = "update";
const PAUSE = "pause";
const TASK = "TASK";
const RUN = "RUN";

const LOCK_PERIOD = 50;

export { SERVICE_NAME, START, STOP, UPDATE, PAUSE, TASK, RUN, LOCK_PERIOD };
