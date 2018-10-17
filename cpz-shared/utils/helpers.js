import { v4 as uuid } from "uuid";
import { REALTIME_MODE, EMULATOR_MODE, BACKTEST_MODE } from "../config/state";

function tryParseJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return false;
  }
  return false;
}

function getModeFromSubject(eventSubject) {
  const str = eventSubject.slice(-1);
  switch (str) {
    case "R":
      return REALTIME_MODE;
    case "E":
      return EMULATOR_MODE;
    case "B":
      return BACKTEST_MODE;
    default:
      return REALTIME_MODE;
  }
}

function subjectToStr(eventSubject) {
  const str = eventSubject.slice(-1);
  switch (str) {
    case "R":
      return "R";
    case "E":
      return "E";
    case "B":
      return "B";
    default:
      return "R";
  }
}
function modeToStr(mode) {
  switch (mode) {
    case REALTIME_MODE:
      return "R";
    case EMULATOR_MODE:
      return "E";
    case BACKTEST_MODE:
      return "B";

    default:
      return "R";
  }
}

function getInvertedTimestamp() {
  const inverted = new Date("3000-01-01").valueOf() - new Date().valueOf();
  const invertedString = inverted.toString();
  const pad = "000000000000000";

  return pad.substring(0, pad.length - invertedString.length) + invertedString;
}

function generateKey() {
  const inverted = getInvertedTimestamp();
  const uid = uuid();
  return `${inverted}_${uid}`;
}

export {
  tryParseJSON,
  getModeFromSubject,
  subjectToStr,
  modeToStr,
  generateKey
};
