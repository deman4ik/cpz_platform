const dayjs = require("dayjs");
const UTCPlugin = require("../cpz-shared/utils/lib/dayjs/plugin/utc");

dayjs.extend(UTCPlugin);

function getCurrentTimeframes(timeframes, date = dayjs()) {
  const hour = date.hour();
  const minute = date.minute();

  let currentTimeframes = [];
  timeframes.forEach(timeframe => {
    console.log(hour, minute, timeframe);
    if (timeframe === 1) {
      currentTimeframes.push(timeframe);
      return;
    }
    if (timeframe > 60) {
      if (hour % (timeframe / 60) === 0 && minute % timeframe === 0)
        currentTimeframes.push(timeframe);
      return;
    }

    if (minute % timeframe === 0) currentTimeframes.push(timeframe);
  });
  if (currentTimeframes.length > 0)
    currentTimeframes = currentTimeframes.sort((a, b) => a < b);
  return currentTimeframes;
}

const tfs = getCurrentTimeframes(
  [1, 5, 10, 15, 30, 60, 120, 600, 720, 1440],
  dayjs("2018-11-04T12:00:07.414Z")
);
console.log(tfs);
