import { BASE_ERROR } from "../base";
import { ADVISER_SETTINGS } from "../settings";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_ADVISER_RUN_EVENT,
  TASKS_ADVISER_PAUSE_EVENT,
  TASKS_ADVISER_RESUME_EVENT
} from "../../types/tasks/adviser";
import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";

const TASKS_ADVISER_START_EVENT_SCHEMA = {
  [TASKS_ADVISER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      integer: true,
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "enum",
      values: VALID_TIMEFRAMES
    },
    strategyName: {
      description: "Strategy file name.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS
    }
  }
};
const TASKS_ADVISER_STOP_EVENT_SCHEMA = {
  [TASKS_ADVISER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_ADVISER_UPDATE_EVENT_SCHEMA = {
  [TASKS_ADVISER_UPDATE_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS
    }
  }
};
const TASKS_ADVISER_STARTED_EVENT_SCHEMA = {
  [TASKS_ADVISER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_ADVISER_STOPPED_EVENT_SCHEMA = {
  [TASKS_ADVISER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_ADVISER_UPDATED_EVENT_SCHEMA = {
  [TASKS_ADVISER_UPDATED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_ADVISER_RUN_EVENT_SCHEMA = {
  [TASKS_ADVISER_RUN_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

const TASKS_ADVISER_PAUSE_EVENT_SCHEMA = {
  [TASKS_ADVISER_PAUSE_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

const TASKS_ADVISER_RESUME_EVENT_SCHEMA = {
  [TASKS_ADVISER_RESUME_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

export {
  TASKS_ADVISER_START_EVENT_SCHEMA,
  TASKS_ADVISER_STOP_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATE_EVENT_SCHEMA,
  TASKS_ADVISER_STARTED_EVENT_SCHEMA,
  TASKS_ADVISER_STOPPED_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATED_EVENT_SCHEMA,
  TASKS_ADVISER_RUN_EVENT_SCHEMA,
  TASKS_ADVISER_PAUSE_EVENT_SCHEMA,
  TASKS_ADVISER_RESUME_EVENT_SCHEMA
};
