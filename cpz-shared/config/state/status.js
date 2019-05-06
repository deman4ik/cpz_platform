/**
 * Статус сервиса
 */
const STATUS_STARTING = "starting"; // Запускается
const STATUS_STARTED = "started"; //  Запущен
const STATUS_PENDING = "pending"; //  Ожидает обработки
const STATUS_BUSY = "busy"; //  Занят, выполняет обработку
const STATUS_STOPPING = "stopping"; // Останавливается
const STATUS_STOPPED = "stopped"; //  Остановлен
const STATUS_STOPPED_AUTO = "stopped_auto"; //  Остановлен автоматически
const STATUS_STOPPED_USER = "stopped_user"; //  Остановлен пользователей
const STATUS_ERROR = "error"; //  Произошла ошибка во время работы (критическая)
const STATUS_WARN = "warn"; //  Произошла ошибка во время работы (не критическая)
const STATUS_FINISHED = "finished"; // Обработка завершена
const STATUS_PAUSED = "paused"; // Пауза
const STATUS_PAUSING = "pausing";
const STATUS_RESUMING = "resuming";

/**
 * Статус позиции
 */
const POS_STATUS_NEW = "new"; // Не определен (создана в системе)
const POS_STATUS_OPEN = "open"; // Позиция открыта (активна) ордер на открытие выставлен
const POS_STATUS_CLOSED = "closed"; // Позиция закрыта (завершена)
const POS_STATUS_CLOSED_AUTO = "closedAuto"; // Позиция закрыта (завершена) автоматически
const POS_STATUS_CANCELED = "canceled"; // Позиция отменена
const POS_STATUS_ERROR = "error"; // Произошла ошибка во время обработки позиции

/**
 * Статус ордера
 */
const ORDER_STATUS_NEW = "new"; // Не определен (создан в системе)
const ORDER_STATUS_OPEN = "open"; // Ордер открыт (создан на бирже)
const ORDER_STATUS_CLOSED = "closed"; // Ордер закрыт (исполнен на бирже)
const ORDER_STATUS_CANCELED = "canceled"; // Ордер отменен
const ORDER_STATUS_ERROR = "error"; // Произошла ошибка во время обработки ордера

/**
 * Задание для ордера
 */
const ORDER_TASK_OPEN_MARKET = "openMarket"; // Выставить ордер по рынку
const ORDER_TASK_OPEN_LIMIT = "openLimit"; // Выставить лимитный ордер
const ORDER_TASK_CHECK = "check"; // Проверить выполненный объем ордера на бирже
const ORDER_TASK_CANCEL = "cancel"; // Отменить ордер

const BLOB_LEASE_STATUS_LOCKED = "locked";
const BLOB_LEASE_STATUS_UNLOCKED = "unlocked";

export {
  STATUS_BUSY,
  STATUS_ERROR,
  STATUS_WARN,
  STATUS_FINISHED,
  STATUS_PENDING,
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPED_AUTO,
  STATUS_STOPPED_USER,
  STATUS_STOPPING,
  STATUS_PAUSED,
  STATUS_PAUSING,
  STATUS_RESUMING,
  POS_STATUS_NEW,
  POS_STATUS_OPEN,
  POS_STATUS_CLOSED,
  POS_STATUS_CLOSED_AUTO,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NEW,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR,
  ORDER_TASK_OPEN_MARKET,
  ORDER_TASK_OPEN_LIMIT,
  ORDER_TASK_CHECK,
  ORDER_TASK_CANCEL,
  BLOB_LEASE_STATUS_LOCKED,
  BLOB_LEASE_STATUS_UNLOCKED
};
