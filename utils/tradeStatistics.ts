import { divideFixed } from "./helpers";
import { cpz } from "../types/cpz";

function calcConsec(profits: number[]) {
  let maxConsecWin = 0;
  let maxConsecLoss = 0;
  let consecWin = 0;
  let consecLos = 0;
  profits.forEach(profit => {
    if (profit > 0) {
      consecWin += 1;
      consecLos = 0;
      if (consecWin > maxConsecWin) maxConsecWin = consecWin;
    } else {
      consecWin = 0;
      consecLos += 1;
      if (consecLos > maxConsecLoss) maxConsecLoss = consecLos;
    }
  });
  return {
    maxConsecWin,
    maxConsecLoss
  };
}

function calcMaxDrawdown(positions: cpz.RobotPositionState[]) {
  let highWaterMark = -Infinity;
  let maxDrawdown = 0;
  let maxDrawdownVal = 0;
  let maxDrawdownSum = 0;
  let posHighWaterMark = null;
  let startPos = -1;
  let endPos = -1;

  for (let i = 0; i < positions.length; i += 1) {
    if (positions[i].profit > highWaterMark) {
      highWaterMark = positions[i].profit;
      posHighWaterMark = i;
    }

    let ddVal = highWaterMark - positions[i].profit;
    let dd = divideFixed(ddVal, highWaterMark);

    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownVal = ddVal;
      startPos = posHighWaterMark;
      endPos = i;
    }
  }

  const drawdownPositions = [];
  if (startPos > -1 && endPos > -1) {
    for (let i = startPos; i <= endPos; i += 1) {
      drawdownPositions.push(positions[i]);
    }
    if (drawdownPositions.length > 0)
      maxDrawdownSum = drawdownPositions
        .map(({ profit }) => profit)
        .reduce((acc, val) => acc + val, 0);
  }
  return {
    maxDrawdown: maxDrawdown * -1,
    maxDrawdownVal: maxDrawdownVal * -1,
    maxDrawdownSum: maxDrawdownSum,
    startPos: startPos > -1 ? positions[startPos] : null,
    endPos: endPos > -1 ? positions[endPos] : null
  };
}

function calcStatistics(positions: cpz.RobotPositionState[]) {
  const statistics: cpz.RobotStats = {};
  const longPositions = positions.filter(
    ({ direction }) => direction === cpz.PositionDirection.long
  );
  const shortPositions = positions.filter(
    ({ direction }) => direction === cpz.PositionDirection.short
  );
  statistics.tradesCount = {
    all: positions.length,
    long: longPositions.length,
    short: shortPositions.length
  };

  const allWinningPositions = positions.filter(({ profit }) => profit > 0);
  const longWinningPositions = longPositions.filter(({ profit }) => profit > 0);
  const shortWinningPositions = shortPositions.filter(
    ({ profit }) => profit > 0
  );
  statistics.tradesWinning = {
    all: allWinningPositions.length,
    long: longWinningPositions.length,
    short: shortWinningPositions.length
  };

  const allLosingPositions = positions.filter(({ profit }) => profit < 0);
  const longLosingPositions = longPositions.filter(({ profit }) => profit < 0);
  const shortLosingPositions = shortPositions.filter(
    ({ profit }) => profit < 0
  );
  statistics.tradesLosing = {
    all: allLosingPositions.length,
    long: longLosingPositions.length,
    short: shortLosingPositions.length
  };

  // Win trades / Number of trades
  statistics.winRate = {
    all: divideFixed(allWinningPositions.length, positions.length) * 100,
    long: divideFixed(longWinningPositions.length, longPositions.length) * 100,
    short:
      divideFixed(shortWinningPositions.length, shortPositions.length) * 100
  };

  // Loss trades / Number of trades
  statistics.lossRate = {
    all: divideFixed(allLosingPositions.length, positions.length) * 100,
    long: divideFixed(longLosingPositions.length, longPositions.length) * 100,
    short: divideFixed(shortLosingPositions.length, shortPositions.length) * 100
  };

  const allAvgBarsHeld = divideFixed(
    positions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    positions.length
  );
  const longAvgBarsHeld = divideFixed(
    longPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    longPositions.length
  );
  const shortAvgBarsHeld = divideFixed(
    shortPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    shortPositions.length
  );
  statistics.avgBarsHeld = {
    all: allAvgBarsHeld,
    long: longAvgBarsHeld,
    short: shortAvgBarsHeld
  };

  const allAvgWinningBarsHeld = divideFixed(
    allWinningPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    allWinningPositions.length
  );
  const longAvgWinningBarsHeld = divideFixed(
    longWinningPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    longWinningPositions.length
  );
  const shortAvgWinningBarsHeld = divideFixed(
    shortWinningPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    shortWinningPositions.length
  );
  statistics.avgBarsHeldWinning = {
    all: allAvgWinningBarsHeld,
    long: longAvgWinningBarsHeld,
    short: shortAvgWinningBarsHeld
  };

  const allAvgLosingBarsHeld = divideFixed(
    allLosingPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    allLosingPositions.length
  );
  const longAvgLosingBarsHeld = divideFixed(
    longLosingPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    longLosingPositions.length
  );
  const shortAvgLosingBarsHeld = divideFixed(
    shortLosingPositions
      .map(({ barsHeld }) => barsHeld)
      .reduce((acc, val) => acc + val, 0),
    shortLosingPositions.length
  );
  statistics.avgBarsHeldLosing = {
    all: allAvgLosingBarsHeld,
    long: longAvgLosingBarsHeld,
    short: shortAvgLosingBarsHeld
  };

  const allNetProfit = positions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const longNetProfit = longPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const shortNetProfit = shortPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  statistics.netProfit = {
    all: allNetProfit,
    long: longNetProfit,
    short: shortNetProfit
  };

  // Net profit / Number of trades
  const allAvgNetProfit = divideFixed(allNetProfit, positions.length);
  const longAvgNetProfit = divideFixed(longNetProfit, longPositions.length);
  const shortAvgNetProfit = divideFixed(shortNetProfit, shortPositions.length);
  statistics.avgNetProfit = {
    all: allAvgNetProfit,
    long: longAvgNetProfit,
    short: shortAvgNetProfit
  };

  const allGrossProfit = allWinningPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const longGrossProfit = longWinningPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const shortGrossProfit = shortWinningPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  statistics.grossProfit = {
    all: allGrossProfit,
    long: longGrossProfit,
    short: shortGrossProfit
  };

  const allAvgGrossProfit = divideFixed(
    allGrossProfit,
    allWinningPositions.length
  );
  const longAvgGrossProfit = divideFixed(
    longGrossProfit,
    longWinningPositions.length
  );
  const shortAvgGrossProfit = divideFixed(
    shortGrossProfit,
    shortWinningPositions.length
  );
  statistics.avgProfit = {
    all: allAvgGrossProfit,
    long: longAvgGrossProfit,
    short: shortAvgGrossProfit
  };

  const allGrossLoss = allLosingPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const longGrossLoss = longLosingPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  const shortGrossLoss = shortLosingPositions
    .map(({ profit }) => profit)
    .reduce((acc, val) => acc + val, 0);
  statistics.grossLoss = {
    all: allGrossLoss,
    long: longGrossLoss,
    short: shortGrossLoss
  };

  const allAvgGrossLoss = divideFixed(allGrossLoss, allLosingPositions.length);
  const longAvgGrossLoss = divideFixed(
    longGrossLoss,
    longLosingPositions.length
  );
  const shortAvgGrossLoss = divideFixed(
    shortGrossLoss,
    shortLosingPositions.length
  );
  statistics.avgLoss = {
    all: allAvgGrossLoss,
    long: longAvgGrossLoss,
    short: shortAvgGrossLoss
  };

  const allProfitFactor = divideFixed(allGrossProfit, allGrossLoss) * -1;
  const longProfitFactor = divideFixed(longGrossProfit, longGrossLoss) * -1;
  const shortProfitFactor = divideFixed(shortGrossProfit, shortGrossLoss) * -1;

  statistics.profitFactor = {
    all: allProfitFactor,
    long: longProfitFactor,
    short: shortProfitFactor
  };

  const allPayoffRatio = divideFixed(allAvgGrossProfit, allAvgGrossLoss) * -1;
  const longPayoffRatio =
    divideFixed(longAvgGrossProfit, longAvgGrossLoss) * -1;
  const shortPayoffRatio =
    divideFixed(shortAvgGrossProfit, shortAvgGrossLoss) * -1;

  statistics.payoffRatio = {
    all: allPayoffRatio,
    long: longPayoffRatio,
    short: shortPayoffRatio
  };

  const {
    maxConsecWin: allMaxConsecWin,
    maxConsecLoss: allMaxConsecLoss
  } = calcConsec(positions.map(({ profit }) => profit));
  const {
    maxConsecWin: longMaxConsecWin,
    maxConsecLoss: longMaxConsecLoss
  } = calcConsec(longPositions.map(({ profit }) => profit));
  const {
    maxConsecWin: shortMaxConsecWin,
    maxConsecLoss: shortMaxConsecLoss
  } = calcConsec(shortPositions.map(({ profit }) => profit));

  statistics.maxConnsecWins = {
    all: allMaxConsecWin,
    long: longMaxConsecWin,
    short: shortMaxConsecWin
  };

  statistics.maxConsecLosses = {
    all: allMaxConsecLoss,
    long: longMaxConsecLoss,
    short: shortMaxConsecLoss
  };

  const {
    maxDrawdown: allMaxDrawdownPerc,
    maxDrawdownSum: allMaxDrawdown,
    endPos: allMaxDrawdownPos
  } = calcMaxDrawdown(positions);
  const {
    maxDrawdown: longMaxDrawdownPerc,
    maxDrawdownSum: longMaxDrawdown,
    endPos: longMaxDrawdownPos
  } = calcMaxDrawdown(longPositions);
  const {
    maxDrawdown: shortMaxDrawdownPerc,
    maxDrawdownSum: shortMaxDrawdown,
    endPos: shortMaxDrawdownPos
  } = calcMaxDrawdown(shortPositions);

  statistics.maxDrawdown = {
    all: allMaxDrawdown,
    long: longMaxDrawdown,
    short: shortMaxDrawdown
  };

  statistics.maxDrawdownPercent = {
    all: allMaxDrawdownPerc,
    long: longMaxDrawdownPerc,
    short: shortMaxDrawdownPerc
  };

  statistics.maxDrawdownDate = {
    all: allMaxDrawdownPos && allMaxDrawdownPos.exitDate,
    long: longMaxDrawdownPos && longMaxDrawdownPos.exitDate,
    short: shortMaxDrawdownPos && shortMaxDrawdownPos.exitDate
  };

  const allRecoveryFactor = divideFixed(allNetProfit, allMaxDrawdown) * -1;
  const longRecoveryFactor = divideFixed(longNetProfit, longMaxDrawdown) * -1;
  const shortRecoveryFactor =
    divideFixed(shortNetProfit, shortMaxDrawdown) * -1;

  statistics.recoveryFactor = {
    all: allRecoveryFactor,
    long: longRecoveryFactor,
    short: shortRecoveryFactor
  };
  return statistics;
}

export { calcStatistics };
