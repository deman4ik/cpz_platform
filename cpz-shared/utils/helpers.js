const getModeFromSubject = eventSubject => {
  const str = eventSubject.slice(-1);
  switch (str) {
    case "R":
      return "realtime";
    case "E":
      return "emulator";
    case "B":
      return "backtest";
    default:
      return "realtime";
  }
};

const subjectToStr = eventSubject => {
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
};
const modeToStr = mode => {
  switch (mode) {
    case "realtime":
      return "R";
    case "emulator":
      return "E";
    case "backtest":
      return "B";

    default:
      return "R";
  }
};

export { getModeFromSubject, subjectToStr, modeToStr };
