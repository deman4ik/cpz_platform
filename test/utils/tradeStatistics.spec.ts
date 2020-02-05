import { calcStatistics } from "../../utils/tradeStatistics";
import { cpz } from "../../@types";

const positions: cpz.RobotPositionState[] = [
  {
    id: "9ccb0710-f9e3-433b-b28f-1d45f4d8671b",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_1",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 966.61,
    entryDate: "2017-01-01T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-01-01T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 1148.8,
    exitDate: "2017-01-05T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-01-05T16:00:00",
    alerts: {},
    profit: 18.219,
    barsHeld: 13
  },
  {
    id: "e484dbe8-07b1-44fb-a515-a3dbca137167",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_2",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 957.69,
    entryDate: "2017-02-01T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-02-01T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 1058.9,
    exitDate: "2017-02-09T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-02-09T16:00:00",
    alerts: {},
    profit: 10.121,
    barsHeld: 26
  },
  {
    id: "7e3cbd47-1edc-41cb-931a-58522332dec4",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_3",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 1011.4,
    entryDate: "2017-02-15T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-02-15T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 1273.3,
    exitDate: "2017-03-07T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-03-07T16:00:00",
    alerts: {},
    profit: 26.19,
    barsHeld: 62
  },
  {
    id: "fef78571-7fca-469f-b91b-d654baeb45aa",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_4",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 1207.7,
    entryDate: "2017-03-13T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-03-13T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 1216,
    exitDate: "2017-03-17T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-03-17T00:00:00",
    alerts: {},
    profit: 0.83,
    barsHeld: 12
  },
  {
    id: "aa2f173b-f174-4221-8037-dadde3db26ae",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_5",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 1345.4,
    entryDate: "2017-04-23T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-04-23T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 1765.9,
    exitDate: "2017-05-15T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-05-15T16:00:00",
    alerts: {},
    profit: 42.05,
    barsHeld: 67
  },
  {
    id: "dc361263-4e74-4564-a1b2-1f1d7c0f8473",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_6",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 1735.9,
    entryDate: "2017-05-16T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-05-16T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 2340.8,
    exitDate: "2017-05-27T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-05-27T00:00:00",
    alerts: {},
    profit: 60.49,
    barsHeld: 31
  },
  {
    id: "378a4753-9da4-4351-a7ea-bff76986e108",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_7",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 2138,
    entryDate: "2017-05-30T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-05-30T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 2859.7,
    exitDate: "2017-06-12T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-06-12T16:00:00",
    alerts: {},
    profit: 72.17,
    barsHeld: 41
  },
  {
    id: "7f5eb6f1-ac99-4dd3-a94a-c865a6e904a0",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_8",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 2533.9,
    entryDate: "2017-06-20T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-06-20T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 2609.8,
    exitDate: "2017-06-25T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-06-25T00:00:00",
    alerts: {},
    profit: 7.59,
    barsHeld: 15
  },
  {
    id: "3545667e-2161-4676-a1ee-d3059c76be48",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_9",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 2720,
    entryDate: "2017-08-03T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-08-03T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4090.1,
    exitDate: "2017-08-19T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-08-19T08:00:00",
    alerts: {},
    profit: 137.01,
    barsHeld: 47
  },
  {
    id: "9da44577-31c9-4237-ae97-f3a26f3c2cf7",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_10",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4008,
    entryDate: "2017-08-20T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-08-20T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4083.9,
    exitDate: "2017-08-23T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-08-23T08:00:00",
    alerts: {},
    profit: 7.59,
    barsHeld: 10
  },
  {
    id: "7fa3f689-4d38-4fd0-969f-67fde9c78400",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_11",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4104.9,
    entryDate: "2017-08-23T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-08-23T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4634.3,
    exitDate: "2017-09-03T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-09-03T16:00:00",
    alerts: {},
    profit: 52.94,
    barsHeld: 33
  },
  {
    id: "dce95f69-a16f-41b9-9506-f63aaac1668b",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_12",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4437.8,
    entryDate: "2017-09-04T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-09-04T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4592.6,
    exitDate: "2017-09-07T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-09-07T08:00:00",
    alerts: {},
    profit: 15.48,
    barsHeld: 10
  },
  {
    id: "bc7a1594-63d0-4be6-8dbf-396907eccb1f",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_13",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4469.9,
    entryDate: "2017-09-07T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-09-07T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4131.9,
    exitDate: "2017-09-11T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-09-11T00:00:00",
    alerts: {},
    profit: -33.8,
    barsHeld: 10
  },
  {
    id: "031a3a6a-f795-4240-92d4-67f061ca0bf2",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_14",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4200.5,
    entryDate: "2017-09-12T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-09-12T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 3125.3,
    exitDate: "2017-09-15T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-09-15T16:00:00",
    alerts: {},
    profit: -107.52,
    barsHeld: 10
  },
  {
    id: "2d1f00ee-f889-42fe-ba75-1685dffe44ec",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_15",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 5705.8,
    entryDate: "2017-10-17T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-10-17T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 5907.3,
    exitDate: "2017-10-24T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-10-24T08:00:00",
    alerts: {},
    profit: 20.15,
    barsHeld: 22
  },
  {
    id: "ec8c18e7-87fb-4fc7-b6a4-23e6a50bd4bf",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_16",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 5731.2,
    entryDate: "2017-10-26T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-10-26T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 7353.9,
    exitDate: "2017-11-09T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-11-09T16:00:00",
    alerts: {},
    profit: 162.27,
    barsHeld: 42
  },
  {
    id: "2b381999-4805-4dff-a7fe-cc620b9235b7",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_17",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 6590,
    entryDate: "2017-11-15T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-11-15T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 17680,
    exitDate: "2017-12-20T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-12-20T00:00:00",
    alerts: {},
    profit: 1109,
    barsHeld: 104
  },
  {
    id: "d689ed27-063d-495e-aff5-0c665557e759",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_18",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 15089,
    entryDate: "2017-12-26T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2017-12-26T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 14304,
    exitDate: "2017-12-30T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2017-12-30T08:00:00",
    alerts: {},
    profit: -78.5,
    barsHeld: 11
  },
  {
    id: "84775361-3b65-4060-8954-f32b350b618b",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_19",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 9243.9,
    entryDate: "2018-05-03T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2018-05-03T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 9658.6,
    exitDate: "2018-05-07T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2018-05-07T08:00:00",
    alerts: {},
    profit: 41.47,
    barsHeld: 11
  },
  {
    id: "cbe0d1cc-2add-49e4-9bbd-66df32169799",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_20",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 7392,
    entryDate: "2018-07-22T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2018-07-22T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 8138.2,
    exitDate: "2018-07-31T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2018-07-31T16:00:00",
    alerts: {},
    profit: 74.62,
    barsHeld: 27
  },
  {
    id: "505818b3-3cd3-4a27-9c4e-8ec7208bdf2b",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_21",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 6524.3,
    entryDate: "2018-10-20T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2018-10-20T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 6562,
    exitDate: "2018-10-23T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2018-10-23T16:00:00",
    alerts: {},
    profit: 3.77,
    barsHeld: 10
  },
  {
    id: "5e6adc14-c53b-4add-bc9d-39e2f691dca5",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_22",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 3812.9,
    entryDate: "2019-03-05T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-03-05T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 3966.942896,
    exitDate: "2019-03-11T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-03-11T16:00:00",
    alerts: {},
    profit: 15.40429,
    barsHeld: 18
  },
  {
    id: "05a3612b-18dd-4cee-b995-36abe44e4de6",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_23",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 3934.3,
    entryDate: "2019-03-12T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-03-12T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 3948.7,
    exitDate: "2019-03-15T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-03-15T08:00:00",
    alerts: {},
    profit: 1.44,
    barsHeld: 10
  },
  {
    id: "fc525a0e-0be1-477f-9aa9-d7bf5a5792d5",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_24",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 3958.638453,
    entryDate: "2019-03-15T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-03-15T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 4129.6,
    exitDate: "2019-03-21T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-03-21T16:00:00",
    alerts: {},
    profit: 17.096155,
    barsHeld: 18
  },
  {
    id: "1003228a-54eb-4ec6-8089-f65e2ef2b254",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_25",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 4045.146046,
    entryDate: "2019-03-23T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-03-23T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 3962.439423,
    exitDate: "2019-03-26T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-03-26T16:00:00",
    alerts: {},
    profit: -8.270662,
    barsHeld: 10
  },
  {
    id: "a0bdddbb-2eb8-4a2b-8433-c26d6b8371aa",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_26",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 3992.7,
    entryDate: "2019-03-27T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-03-27T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 5190.549519,
    exitDate: "2019-04-11T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-04-11T16:00:00",
    alerts: {},
    profit: 119.784952,
    barsHeld: 46
  },
  {
    id: "ffc66ec0-7884-4e6d-816f-167347640255",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_27",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 5130,
    entryDate: "2019-04-15T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-04-15T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 5497.4,
    exitDate: "2019-04-26T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-04-26T00:00:00",
    alerts: {},
    profit: 36.74,
    barsHeld: 33
  },
  {
    id: "a06dd7c6-8484-4bc9-937a-c065c9f2ade5",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_28",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 5215.6,
    entryDate: "2019-04-26T08:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-04-26T08:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 5507.8,
    exitDate: "2019-04-29T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-04-29T16:00:00",
    alerts: {},
    profit: 29.22,
    barsHeld: 10
  },
  {
    id: "de06e4a2-542c-4c94-bb49-5dbe93bba56d",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_29",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 5402.8,
    entryDate: "2019-04-30T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-04-30T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 7340,
    exitDate: "2019-05-17T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-05-17T16:00:00",
    alerts: {},
    profit: 193.72,
    barsHeld: 53
  },
  {
    id: "130cccd6-0336-4d28-87ce-862d4db2a1fc",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_30",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 7177.9,
    entryDate: "2019-05-18T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-05-18T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 7974.9,
    exitDate: "2019-05-23T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-05-23T00:00:00",
    alerts: {},
    profit: 79.7,
    barsHeld: 15
  },
  {
    id: "b314b70c-4e37-407c-9a9a-ef4261701a45",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_31",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 7760.1,
    entryDate: "2019-05-24T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-05-24T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 8966.5,
    exitDate: "2019-05-31T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-05-31T00:00:00",
    alerts: {},
    profit: 120.64,
    barsHeld: 21
  },
  {
    id: "632ae263-54d8-4c3f-aa9a-2d9ef8a6cd8f",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_32",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 8325.9,
    entryDate: "2019-06-01T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-06-01T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 8099.2,
    exitDate: "2019-06-04T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-06-04T08:00:00",
    alerts: {},
    profit: -22.67,
    barsHeld: 10
  },
  {
    id: "07ea8602-8663-4912-9116-7120635436c6",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_33",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 7935.271465,
    entryDate: "2019-06-11T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-06-11T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 11743.668906,
    exitDate: "2019-06-30T16:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-06-30T16:00:00",
    alerts: {},
    profit: 380.839744,
    barsHeld: 59
  },
  {
    id: "6bc49a82-1296-455f-9af8-41ead5f43299",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_34",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 11438,
    entryDate: "2019-07-04T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-07-04T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 11276,
    exitDate: "2019-07-07T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-07-07T08:00:00",
    alerts: {},
    profit: -16.2,
    barsHeld: 10
  },
  {
    id: "8d6d9ce7-9353-48e9-b26f-4bdcc6e07a06",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_35",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 11228.970837,
    entryDate: "2019-07-07T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-07-07T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 12093,
    exitDate: "2019-07-11T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-07-11T08:00:00",
    alerts: {},
    profit: 86.402916,
    barsHeld: 11
  },
  {
    id: "aea0a4d7-bdd2-43f2-801a-1132d98cd683",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",

    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_36",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 11495,
    entryDate: "2019-07-13T00:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-07-13T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 10820,
    exitDate: "2019-07-16T08:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-07-16T08:00:00",
    alerts: {},
    profit: -67.5,
    barsHeld: 10
  },
  {
    id: "88e36071-c9ad-40ef-8fa1-c7363add0265",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_37",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 9206,
    entryDate: "2019-11-04T16:00:00",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-11-04T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 9189.9,
    exitDate: "2019-11-08T00:00:00",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-11-08T00:00:00",
    alerts: {},
    profit: -1.61,
    barsHeld: 10
  },
  {
    id: "357bbdd5-c314-4df2-9f22-01079a38469d",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_38",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 8497.2,
    entryDate: "2020-01-14T16:00:06.222",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2020-01-14T16:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 8666.422958,
    exitDate: "2020-01-21T00:00:09.995",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2020-01-21T00:00:00",
    alerts: {},
    profit: 16.922296,
    barsHeld: 19
  },
  {
    id: "5cd20d66-db5e-41f5-a4f5-e46ee41b5e84",
    robotId: "00bde0ba-5202-4378-8f97-34d895b15d96",
    timeframe: 480,
    volume: 0.1,
    prefix: "p",
    code: "p_39",
    parentId: null,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 8456.992847,
    entryDate: "2020-01-27T00:00:07.15",
    entryOrderType: cpz.OrderType.market,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2020-01-27T00:00:00",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 9309.2,
    exitDate: "2020-02-04T08:00:07.506",
    exitOrderType: cpz.OrderType.market,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2020-02-04T08:00:00",
    alerts: {},
    profit: 85.220715,
    barsHeld: 25
  }
];

describe("Test 'tradeStatistics' utils", () => {
  describe("Test 'calcStatistics'", () => {
    it("Should calc stats", () => {
      const result = calcStatistics(positions);
      console.log(result.statistics.performance);
      console.log(result.equity.changes);
      expect(result).toBeTruthy();
    });
  });
});
