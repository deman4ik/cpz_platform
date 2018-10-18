/**
 * Статус сервиса
 */
const STATUS_STARTED = "started"; //  Запущен
const STATUS_PENDING = "pending"; //  Ожидает обработки
const STATUS_BUSY = "busy"; //  Занят, выполняет обработку
const STATUS_STOPPED = "stopped"; //  Остановлен
const STATUS_ERROR = "error"; //  Произошла ошибка во время работы
const STATUS_FINISHED = "finished"; // Обработка завершена

/**
 * Статус позиции
 */
const POS_STATUS_NONE = "none"; // Не определен
const POS_STATUS_OPENED = "opened"; // Позиция открыта (активна)
const POS_STATUS_CLOSED = "closed"; // Позиция закрыта (завершена)
const POS_STATUS_CANCELED = "canceled"; // Позиция отменена
const POS_STATUS_ERROR = "error"; // Произошла ошибка во время обработки позиции

/**
 * Статус ордера
 */
const ORDER_STATUS_NONE = "none"; // Не определен
const ORDER_STATUS_OPENED = "opened"; // Ордер открыт (создан в системе)
const ORDER_STATUS_CLOSED = "closed"; // Ордер закрыт (исполнен на бирже)
const ORDER_STATUS_POSTED = "posted"; // Ордер выставлен на биржу
const ORDER_STATUS_CANCELED = "canceled"; // Ордер отменен
const ORDER_STATUS_ERROR = "error"; // Произошла ошибка во время обработки ордера

/**
 * Задание для ордера
 */
const ORDER_TASK_OPENBYMARKET = "openByMarket"; // Выставить ордер по рынку
const ORDER_TASK_SETLIMIT = "setLimit"; // Выставить лимитный ордер
const ORDER_TASK_CHECKLIMIT = "checkLimit"; // Проверить выполненный объем ордера на бирже

export {
  STATUS_BUSY,
  STATUS_ERROR,
  STATUS_FINISHED,
  STATUS_PENDING,
  STATUS_STARTED,
  STATUS_STOPPED,
  POS_STATUS_NONE,
  POS_STATUS_OPENED,
  POS_STATUS_CLOSED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NONE,
  ORDER_STATUS_OPENED,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_POSTED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT
};
