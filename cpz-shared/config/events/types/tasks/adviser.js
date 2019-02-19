import { BASE_ERROR } from "../base";
import { ADVISER_SETTINGS } from "../settings";
/**
 * Событие - Запуск нового советника
 */
const TASKS_ADVISER_START_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "int",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
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

/**
 * Событие - Остановка советника
 */
const TASKS_ADVISER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

/**
 * Событие - Обновление параметров советника
 */
const TASKS_ADVISER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Update",

  dataSchema: {
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

/**
 *  Событие - Советник запущен
 */
const TASKS_ADVISER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Started",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Советник остановлен
 */
const TASKS_ADVISER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Параметры советника обновлены
 */
const TASKS_ADVISER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Updated",

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
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_UPDATED_EVENT
};
