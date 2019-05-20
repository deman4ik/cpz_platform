import dayjs from "cpz/utils/dayjs";

function timeframeToString(timeframe) {
  if (timeframe < 60) {
    return `${timeframe}m`;
  }
  if (timeframe >= 60 && timeframe < 1440) {
    return `${timeframe / 60}h`;
  }
  if (timeframe >= 1440 && timeframe < 10080) {
    return `${timeframe / 1440}d`;
  }
  if (timeframe >= 10080) {
    return `${timeframe / 10080}w`;
  }
  throw new Error("Invalid timeframe");
}

function stringToTimeframe(timeframeStr) {
  if (timeframeStr.endsWith("m")) {
    return +timeframeStr.replace("m", "");
  }
  if (timeframeStr.endsWith("h")) {
    return +timeframeStr.replace("h", "") * 60;
  }
  if (timeframeStr.endsWith("d")) {
    return +timeframeStr.replace("d", "") * 1440;
  }
  if (timeframeStr.endsWith("w")) {
    return +timeframeStr.replace("w", "") * 10080;
  }
  return timeframeStr;
}

function getLowerTimeframe(timeframe) {
  if (timeframe < 60) {
    return 1;
  }
  if (timeframe >= 60 && timeframe < 1440) {
    return 60;
  }
  if (timeframe >= 1440 && timeframe < 10080) {
    return 1440;
  }
  if (timeframe >= 10080) {
    return 10080;
  }
  throw new Error("Invalid timeframe");
}

function getCurrentSince(number, timeframe) {
  if (timeframe === 1) {
    if (number === 1)
      return dayjs
        .utc()
        .startOf("minute")
        .valueOf();
    return dayjs
      .utc()
      .add(-number, "minute")
      .startOf("minute")
      .valueOf();
  }
  if (timeframe < 60) {
    return dayjs
      .utc()
      .add(-dayjs.utc().minute() % (number * timeframe), "minute")
      .startOf("minute")
      .valueOf();
  }
  if (timeframe < 1440) {
    if (timeframe === 60 && number === 1)
      return dayjs
        .utc()
        .startOf("hour")
        .valueOf();
    return dayjs
      .utc()
      .add(-dayjs.utc().hour() % (number * (timeframe / 60)), "hour")
      .startOf("hour")
      .valueOf();
  }
  if (number === 1)
    return dayjs
      .utc()
      .startOf("day")
      .valueOf();
  return dayjs
    .utc()
    .add(-dayjs.utc().day() % (number * (timeframe / 1440)), "day")
    .startOf("day")
    .valueOf();
}

function hasTimeframe(timeframes, timeframeStr) {
  return Object.prototype.hasOwnProperty.call(timeframes, timeframeStr);
}

function getCurrentCandleParams(timeframes, timeframe) {
  const timeframeStr = timeframeToString(timeframe);

  const params = {
    timeframe,
    timeframeStr,
    since: getCurrentSince(1, timeframe),
    limit: 1,
    batch: false
  };
  const exchangeHasTimeframe = hasTimeframe(timeframes, timeframeStr);

  if (!exchangeHasTimeframe) {
    const lowerTimeframe = getLowerTimeframe(timeframe);
    params.timeframe = lowerTimeframe;
    params.timeframeStr = timeframeToString(lowerTimeframe);
    params.since = getCurrentSince(timeframe / lowerTimeframe, lowerTimeframe);
    params.limit = timeframe / lowerTimeframe;
    params.batch = true;
  }

  return params;
}

export { timeframeToString, stringToTimeframe, getCurrentCandleParams };
