import { BASE_ERROR } from "../base";
import { TRADER_SETTINGS } from "../settings";
/**
 * Событие - запуск нового проторговщика
 */
const TASKS_TRADER_START_EVENT = {
  eventType: "CPZ.Tasks.Trader.Start",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id. - 'AdvisorName'",
      type: "number",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    settings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  }
};

/**
 * Событие - Остановка проторговщика
 */
const TASKS_TRADER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

/**
 * Событие - Обновление параметров проторговщика
 */
const TASKS_TRADER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Trader.Update",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  }
};

/**
 * Событие - Проторговщик запущен
 */
const TASKS_TRADER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Started",

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
 * Событие - Проторговщик остановлен
 */
const TASKS_TRADER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stopped",

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
 * Событие - параметры проторговщика обновлены
 */
const TASKS_TRADER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Updated",

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
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_UPDATED_EVENT
};
