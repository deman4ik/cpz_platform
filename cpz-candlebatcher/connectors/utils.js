const dayjs = require("dayjs");

function durationMinutes(dateFrom, dateTo, positive = false) {
  const duration = dayjs(dateTo).diff(dateFrom, "minutes");
  if (positive) return duration > 0 ? duration : 0;
  return duration;
}

function completedPercent(completedDuration, totalDuration) {
  // Процент выполнения
  const percent = (completedDuration / totalDuration) * 100;
  // Не может быть больше 100
  return percent <= 100 ? percent : 100;
}

module.exports = {
  durationMinutes,
  completedPercent
};
