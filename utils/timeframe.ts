import dayjs from "../lib/dayjs";

function getCurrentSince(number: number, timeframe: number): number {
  const currentDate = dayjs.utc();
  if (timeframe === 1) {
    if (number === 1) return currentDate.startOf("minute").valueOf();
    return currentDate
      .add(-number, "minute")
      .startOf("minute")
      .valueOf();
  }
  if (timeframe < 60) {
    return currentDate
      .add(-currentDate.minute() % (number * timeframe), "minute")
      .startOf("minute")
      .valueOf();
  }
  if (timeframe < 1440) {
    if (timeframe === 60 && number === 1)
      return currentDate.startOf("hour").valueOf();
    return currentDate
      .add(-currentDate.hour() % (number * (timeframe / 60)), "hour")
      .startOf("hour")
      .valueOf();
  }
  if (timeframe >= 1440) {
    if (timeframe === 1440 && number === 1)
      return currentDate.startOf("day").valueOf();
    return currentDate
      .add(-currentDate.day() % (number * (timeframe / 1440)), "day")
      .startOf("day")
      .valueOf();
  }
  throw new Error("Invalid timeframe");
}

function timeframeToString(timeframe: number): string {
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

function stringToTimeframe(timeframeStr: string): number {
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
  return null;
}

function getLowerTimeframe(timeframe: number): number {
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

function hasTimeframe(timeframes: number[], timeframeStr: string): boolean {
  return Object.prototype.hasOwnProperty.call(timeframes, timeframeStr);
}

function getCurrentCandleParams(timeframes: number[], timeframe: number) {
  const timeframeStr = timeframeToString(timeframe);

  const candleTime = getCurrentSince(1, timeframe);
  const params = {
    timeframe,
    timeframeStr,
    since: candleTime,
    time: candleTime,
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
