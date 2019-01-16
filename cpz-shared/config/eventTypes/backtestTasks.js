import { BASE_ERROR } from "./events";

const TASKS_BACKTEST_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTEST_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTEST_FINISHED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Finished",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export {
  TASKS_BACKTEST_STARTED_EVENT,
  TASKS_BACKTEST_STOPPED_EVENT,
  TASKS_BACKTEST_FINISHED_EVENT
};
