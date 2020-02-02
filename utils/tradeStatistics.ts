import {
  divideRound,
  round,
  chunkArray,
  average,
  averageRound
} from "./helpers";
import dayjs from "../lib/dayjs";
import { cpz } from "../@types";

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

function calcMaxDrawdown(positions: cpz.PositionDataForStats[]) {
  let accum = 0;
  let localMax = 0;
  let maxDrawdown = 0;
  let maxDrawdownPos = null;
  for (let i = 0; i < positions.length; i++) {
    const { profit } = positions[i];
    accum += profit;

    if (accum > localMax) localMax = accum;

    const drawdown = accum - localMax;
    if (maxDrawdown > drawdown) {
      maxDrawdown = round(drawdown, 2);
      maxDrawdownPos = positions[i];
    }
  }
  return {
    maxDrawdown,
    maxDrawdownPos
  };
}

const cumulativeProfit = (sum => ({
  exitDate,
  profit
}: cpz.PositionDataForStats) => ({
  exitDate,
  profit: sum += profit
}))(0);

function calcStatistics(
  positions: cpz.PositionDataForStats[]
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
  equity.tradesCount = allPositions.length;

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
    all: round(
      divideRound(allWinningPositions.length, allPositions.length) * 100,
      2
    ),
    long: round(
      divideRound(longWinningPositions.length, longPositions.length) * 100,
      2
    ),
    short: round(
      divideRound(shortWinningPositions.length, shortPositions.length) * 100,
      2
    )
  };
  equity.winRate = statistics.winRate.all;

  // Loss trades / Number of trades
  statistics.lossRate = {
    all: round(
      divideRound(allLosingPositions.length, allPositions.length) * 100,
      2
    ),
    long: round(
      divideRound(longLosingPositions.length, longPositions.length) * 100,
      2
    ),
    short: round(
      divideRound(shortLosingPositions.length, shortPositions.length) * 100,
      2
    )
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
    2
  );
  const longNetProfit = round(
    longPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
  );
  const shortNetProfit = round(
    shortPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
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
    2
  );
  const longGrossProfit = round(
    longWinningPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
  );
  const shortGrossProfit = round(
    shortWinningPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
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
    2
  );
  const longGrossLoss = round(
    longLosingPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
  );
  const shortGrossLoss = round(
    shortLosingPositions
      .map(({ profit }) => +profit)
      .reduce((acc, val) => acc + val, 0),
    2
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

  const allProfitFactor = Math.abs(divideRound(allGrossProfit, allGrossLoss));
  const longProfitFactor = Math.abs(
    divideRound(longGrossProfit, longGrossLoss)
  );
  const shortProfitFactor = Math.abs(
    divideRound(shortGrossProfit, shortGrossLoss)
  );

  statistics.profitFactor = {
    all: allProfitFactor,
    long: longProfitFactor,
    short: shortProfitFactor
  };

  const allPayoffRatio = Math.abs(
    divideRound(allAvgGrossProfit, allAvgGrossLoss)
  );
  const longPayoffRatio = Math.abs(
    divideRound(longAvgGrossProfit, longAvgGrossLoss)
  );
  const shortPayoffRatio = Math.abs(
    divideRound(shortAvgGrossProfit, shortAvgGrossLoss)
  );

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
    maxDrawdown: allMaxDrawdown,
    maxDrawdownPos: allMaxDrawdownPos
  } = calcMaxDrawdown(positions);
  const {
    maxDrawdown: longMaxDrawdown,
    maxDrawdownPos: longMaxDrawdownPos
  } = calcMaxDrawdown(longPositions);
  const {
    maxDrawdown: shortMaxDrawdown,
    maxDrawdownPos: shortMaxDrawdownPos
  } = calcMaxDrawdown(shortPositions);

  statistics.maxDrawdown = {
    all: allMaxDrawdown,
    long: longMaxDrawdown,
    short: shortMaxDrawdown
  };
  equity.maxDrawdown = statistics.maxDrawdown.all;

  statistics.maxDrawdownDate = {
    all: allMaxDrawdownPos && allMaxDrawdownPos.exitDate,
    long: longMaxDrawdownPos && longMaxDrawdownPos.exitDate,
    short: shortMaxDrawdownPos && shortMaxDrawdownPos.exitDate
  };

  const allRecoveryFactor = Math.abs(divideRound(allNetProfit, allMaxDrawdown));
  const longRecoveryFactor = Math.abs(
    divideRound(longNetProfit, longMaxDrawdown)
  );
  const shortRecoveryFactor = Math.abs(
    divideRound(shortNetProfit, shortMaxDrawdown)
  );

  statistics.recoveryFactor = {
    all: allRecoveryFactor,
    long: longRecoveryFactor,
    short: shortRecoveryFactor
  };

  statistics.lastUpdatedAt = dayjs.utc().toISOString();

  const maxEquityLength = 50;
  let chunkLength;

  const equityChart = allPositions.map(cumulativeProfit);

  statistics.perfomance = equityChart.map(({ exitDate, profit }) => ({
    x: dayjs.utc(exitDate).valueOf(),
    y: round(profit, 2)
  }));

  if (equityChart.length < maxEquityLength) {
    chunkLength = 1;
  } else if (
    equityChart.length > maxEquityLength &&
    equityChart.length < maxEquityLength * 2
  ) {
    chunkLength = 1.5;
  } else {
    chunkLength = equityChart.length / maxEquityLength;
  }
  const equityChunks = chunkArray(equityChart, chunkLength);
  equity.changes = equityChunks.map(chunk => ({
    x: dayjs.utc(chunk[chunk.length - 1].exitDate).valueOf(),
    y: round(average(...chunk.map(c => +c.profit)), 2)
  }));

  return { statistics, equity };
}

export { calcStatistics };
