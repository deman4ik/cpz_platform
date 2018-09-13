const moment = require("moment");

function durationMinutes(dateFrom, dateTo, positive = false) {
  const duration = moment
    .duration(moment(dateTo).diff(moment(dateFrom)))
    .asMinutes();
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
