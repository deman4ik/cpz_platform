import {
  divideRound,
  round,
  chunkArray,
  average,
  averageRound
} from "./helpers";
import dayjs from "../lib/dayjs";
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
    maxConsecWin: round(maxConsecWin, 6),
    maxConsecLoss: round(maxConsecLoss, 6)
  };
}

function calcMaxDrawdown(positions: cpz.RobotPositionState[]) {
  let highWaterMark: number = -Infinity;
  let maxDrawdown: number = 0;
  let maxDrawdownVal: number = 0;
  let maxDrawdownSum: number = 0;
  let posHighWaterMark: number = null;
  let startPos: number = -1;
  let endPos: number = -1;

  for (let i = 0; i < positions.length; i += 1) {
    const profit = +positions[i].profit;
    if (profit > highWaterMark) {
      highWaterMark = profit;
      posHighWaterMark = i;
    }

    let ddVal = highWaterMark - profit;
    let dd = divideRound(ddVal, highWaterMark);

    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownVal = ddVal;
      startPos = posHighWaterMark;
      endPos = i;
    }
  }

  const drawdownPositions = [];
  if (startPos > -1 && endPos > -1) {
    for (let i = startPos + 1; i <= endPos; i += 1) {
      drawdownPositions.push(positions[i]);
    }
    if (drawdownPositions.length > 0)
      maxDrawdownSum = drawdownPositions
        .map(({ profit }) => +profit)
        .reduce((acc, val) => acc + val, 0);
  }
  return {
    maxDrawdown: round(maxDrawdown * -1, 6),
    maxDrawdownVal: round(maxDrawdownVal * -1, 6),
    maxDrawdownSum: round(maxDrawdownSum, 6),
    startPos: startPos > -1 ? positions[startPos] : null,
    endPos: endPos > -1 ? positions[endPos] : null
  };
}

function calcStatistics(
  positions: cpz.RobotPositionState[]
): {
  statistics: cpz.RobotStats;
  equity: cpz.RobotEquity;
} {
  const statistics: cpz.RobotStats = {};
  const equity: cpz.RobotEquity = {};

  if (!positions || !Array.isArray(positions) || positions.length === 0)
    return { statistics, equity };

  const allPositions = positions.map(pos => ({
    ...pos,
    profit: +pos.profit,
    barsHeld: +pos.barsHeld
  }));
  const longPositions = allPositions.filter(
    ({ direction }) => direction === cpz.PositionDirection.long
  );
  const shortPositions = allPositions.filter(
    ({ direction }) => direction === cpz.PositionDirection.short
  );
  const lastPosition = allPositions[allPositions.length - 1];
  equity.lastProfit = lastPosition.profit;

  statistics.tradesCount = {
    all: allPositions.length,
    long: longPositions.length,
    short: shortPositions.length
  };

  const allWinningPositions = allPositions.filter(({ profit }) => +profit > 0);
  const longWinningPositions = longPositions.filter(
    ({ profit }) => +profit > 0
  );
  const shortWinningPositions = shortPositions.filter(
    ({ profit }) => +profit > 0
  );
  statistics.tradesWinning = {
    all: allWinningPositions.length,
    long: longWinningPositions.length,
    short: shortWinningPositions.length
  };

  const allLosingPositions = allPositions.filter(({ profit }) => +profit < 0);
  const longLosingPositions = longPositions.filter(({ profit }) => +profit < 0);
  const shortLosingPositions = shortPositions.filter(
    ({ profit }) => +profit < 0
  );
  statistics.tradesLosing = {
    all: allLosingPositions.length,
    long: longLosingPositions.length,
    short: shortLosingPositions.length
  };

  // Win trades / Number of trades
  statistics.winRate = {
    all: divideRound(allWinningPositions.length, allPositions.length) * 100,
    long: divideRound(longWinningPositions.length, longPositions.length) * 100,
    short:
      divideRound(shortWinningPositions.length, shortPositions.length) * 100
  };

  // Loss trades / Number of trades
  statistics.lossRate = {
    all: divideRound(allLosingPositions.length, allPositions.length) * 100,
    long: divideRound(longLosingPositions.length, longPositions.length) * 100,
    short: divideRound(shortLosingPositions.length, shortPositions.length) * 100
  };

  const allAvgBarsHeld = averageRound(
    ...allPositions.map(({ barsHeld }) => +barsHeld)
  );
  const longAvgBarsHeld = averageRound(
    ...longPositions.map(({ barsHeld }) => +barsHeld)
  );
  const shortAvgBarsHeld = averageRound(
    ...shortPositions.map(({ barsHeld }) => +barsHeld)
  );
  statistics.avgBarsHeld = {
    all: allAvgBarsHeld,
    long: longAvgBarsHeld,
    short: shortAvgBarsHeld
  };

  const allAvgWinningBarsHeld = averageRound(
    ...allWinningPositions.map(({ barsHeld }) => +barsHeld)
  );
  const longAvgWinningBarsHeld = averageRound(
    ...longWinningPositions.map(({ barsHeld }) => +barsHeld)
  );
  const shortAvgWinningBarsHeld = averageRound(
    ...shortWinningPositions.map(({ barsHeld }) => +barsHeld)
  );
  statistics.avgBarsHeldWinning = {
    all: allAvgWinningBarsHeld,
    long: longAvgWinningBarsHeld,
    short: shortAvgWinningBarsHeld
  };

  const allAvgLosingBarsHeld = averageRound(
    ...allLosingPositions.map(({ barsHeld }) => +barsHeld)
  );
  const longAvgLosingBarsHeld = averageRound(
    ...longLosingPositions.map(({ barsHeld }) => +barsHeld)
  );
  const shortAvgLosingBarsHeld = averageRound(
    ...shortLosingPositions.map(({ barsHeld }) => +barsHeld)
  );
  statistics.avgBarsHeldLosing = {
    all: allAvgLosingBarsHeld,
    long: longAvgLosingBarsHeld,
    short: shortAvgLosingBarsHeld
  };

  const allNetProfit = round(
    allPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const longNetProfit = round(
    longPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const shortNetProfit = round(
    shortPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  statistics.netProfit = {
    all: allNetProfit,
    long: longNetProfit,
    short: shortNetProfit
  };
  equity.profit = allNetProfit;

  // Net profit / Number of trades
  const allAvgNetProfit = divideRound(allNetProfit, allPositions.length);
  const longAvgNetProfit = divideRound(longNetProfit, longPositions.length);
  const shortAvgNetProfit = divideRound(shortNetProfit, shortPositions.length);
  statistics.avgNetProfit = {
    all: allAvgNetProfit,
    long: longAvgNetProfit,
    short: shortAvgNetProfit
  };

  const allGrossProfit = round(
    allWinningPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const longGrossProfit = round(
    longWinningPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const shortGrossProfit = round(
    shortWinningPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  statistics.grossProfit = {
    all: allGrossProfit,
    long: longGrossProfit,
    short: shortGrossProfit
  };

  const allAvgGrossProfit = divideRound(
    allGrossProfit,
    allWinningPositions.length
  );
  const longAvgGrossProfit = divideRound(
    longGrossProfit,
    longWinningPositions.length
  );
  const shortAvgGrossProfit = divideRound(
    shortGrossProfit,
    shortWinningPositions.length
  );
  statistics.avgProfit = {
    all: allAvgGrossProfit,
    long: longAvgGrossProfit,
    short: shortAvgGrossProfit
  };

  const allGrossLoss = round(
    allLosingPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const longGrossLoss = round(
    longLosingPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  const shortGrossLoss = round(
    shortLosingPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    6
  );
  statistics.grossLoss = {
    all: allGrossLoss,
    long: longGrossLoss,
    short: shortGrossLoss
  };

  const allAvgGrossLoss = divideRound(allGrossLoss, allLosingPositions.length);
  const longAvgGrossLoss = divideRound(
    longGrossLoss,
    longLosingPositions.length
  );
  const shortAvgGrossLoss = divideRound(
    shortGrossLoss,
    shortLosingPositions.length
  );
  statistics.avgLoss = {
    all: allAvgGrossLoss,
    long: longAvgGrossLoss,
    short: shortAvgGrossLoss
  };

  const allProfitFactor = divideRound(allGrossProfit, allGrossLoss) * -1;
  const longProfitFactor = divideRound(longGrossProfit, longGrossLoss) * -1;
  const shortProfitFactor = divideRound(shortGrossProfit, shortGrossLoss) * -1;

  statistics.profitFactor = {
    all: allProfitFactor,
    long: longProfitFactor,
    short: shortProfitFactor
  };

  const allPayoffRatio = divideRound(allAvgGrossProfit, allAvgGrossLoss) * -1;
  const longPayoffRatio =
    divideRound(longAvgGrossProfit, longAvgGrossLoss) * -1;
  const shortPayoffRatio =
    divideRound(shortAvgGrossProfit, shortAvgGrossLoss) * -1;

  statistics.payoffRatio = {
    all: allPayoffRatio,
    long: longPayoffRatio,
    short: shortPayoffRatio
  };

  const {
    maxConsecWin: allMaxConsecWin,
    maxConsecLoss: allMaxConsecLoss
  } = calcConsec(positions.map(({ profit }) => +profit));
  const {
    maxConsecWin: longMaxConsecWin,
    maxConsecLoss: longMaxConsecLoss
  } = calcConsec(longPositions.map(({ profit }) => +profit));
  const {
    maxConsecWin: shortMaxConsecWin,
    maxConsecLoss: shortMaxConsecLoss
  } = calcConsec(shortPositions.map(({ profit }) => +profit));

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

  const allRecoveryFactor = divideRound(allNetProfit, allMaxDrawdown) * -1;
  const longRecoveryFactor = divideRound(longNetProfit, longMaxDrawdown) * -1;
  const shortRecoveryFactor =
    divideRound(shortNetProfit, shortMaxDrawdown) * -1;

  statistics.recoveryFactor = {
    all: allRecoveryFactor,
    long: longRecoveryFactor,
    short: shortRecoveryFactor
  };

  const positionChunks = chunkArray(allPositions, 50);
  equity.changes = positionChunks.map(chunk => ({
    x: dayjs.utc(chunk[chunk.length - 1].exitDate).valueOf(),
    y: averageRound(...chunk.map(c => +c.profit))
  }));

  return { statistics, equity };
}

export { calcStatistics };
