import { cpz } from "../../@types";
import UserRobot from "../../state/userRobot/userRobot";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

let robotId = uuid();
const robot = {
  exchange: "kraken",
  asset: "BTC",
  currency: "USD",
  timeframe: 5,
  tradeSettings: {
    slippage: {
      entry: {
        stepPercent: 10,
        count: 3
      },
      exit: {
        stepPercent: 10,
        count: 3
      }
    },
    deviation: {
      entry: 2,
      exit: 2
    },
    orderTimeout: 120,
    multiPosition: false
  }
};
let userRobot: any;
describe("Test User Robot", () => {
  beforeEach(() => {
    userRobot = new UserRobot({
      id: uuid(),
      userExAccId: uuid(),
      userId: uuid(),
      robotId,
      settings: {
        volume: 1,
        kraken: {
          leverage: 2
        }
      },
      internalState: {},
      status: cpz.Status.started,
      startedAt: dayjs.utc("2019-10-25T00:00:00.000Z").toISOString(),
      robot,
      positions: []
    });
  });

  it("Should create new Long Position", () => {
    const signal: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.long,
      orderType: cpz.OrderType.stop,
      price: 6500
    };

    userRobot.handleSignal(signal);
    expect(userRobot.state.positions.length).toBe(1);
    expect(userRobot.state.positions[0].direction).toBe(
      cpz.PositionDirection.long
    );
    expect(userRobot.state.ordersToCreate[0].signalPrice).toBe(signal.price);
    expect(userRobot.state.ordersToCreate[0].price).toBe(7152);
  });

  it("Should create new Short Position", () => {
    const signal: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signal);
    expect(userRobot.state.positions.length).toBe(1);
    expect(userRobot.state.positions[0].direction).toBe(
      cpz.PositionDirection.short
    );
    expect(userRobot.state.ordersToCreate[0].signalPrice).toBe(signal.price);
    expect(userRobot.state.ordersToCreate[0].price).toBe(5848);
  });

  it("Should set order price without modifications", () => {
    const signal: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    userRobot.handleSignal(signal);
    expect(userRobot.state.positions.length).toBe(1);
    expect(userRobot.state.positions[0].direction).toBe(
      cpz.PositionDirection.short
    );
    expect(userRobot.state.ordersToCreate[0].signalPrice).toBe(signal.price);
    expect(userRobot.state.ordersToCreate[0].price).toBe(signal.price);
  });

  it("Should create order job to cancel position", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);

    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.open,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString()
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 6500
    };
    userRobot.handleSignal(signalClose);

    expect(userRobot.state.connectorJobs.length).toBe(1);
    expect(userRobot.state.connectorJobs[0].type).toBe(cpz.OrderJobType.cancel);
  });

  it("Should create order to close position", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    expect(userRobot.state.ordersToCreate.length).toBe(1);
    expect(userRobot.state.ordersToCreate[0].signalPrice).toBe(
      signalClose.price
    );
    expect(userRobot.state.ordersToCreate[0].price).toBe(6599.8);
  });

  it("Should create order to close previous position", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    expect(userRobot.state.ordersToCreate.length).toBe(1);
    expect(userRobot.state.ordersToCreate[0].positionId).toBe(
      openOrder.positionId
    );
    expect(userRobot.state.ordersToCreate[0].signalPrice).toBe(
      signalClose.price
    );
    expect(userRobot.state.ordersToCreate[0].price).toBe(6599.8);
  });

  it("Should force close position after new open signal", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalOpenNew: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };
    userRobot.handleSignal(signalOpenNew);
    expect(userRobot.state.positions[0].nextJob).toBe(
      cpz.UserPositionJob.cancel
    );
    expect(userRobot.state.ordersToCreate.length).toBe(1);
    expect(userRobot.state.ordersToCreate[0].type).toBe(
      cpz.OrderType.forceMarket
    );
  });

  it("Should close position", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: null,
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].exitDate).toBe(closeOrder.exTimestamp);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.closed
    );
  });

  it("Should handle entry partial order", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: 0.2,
      remaining: 0.8
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.open
    );
    expect(userRobot.state.positions[0].entryStatus).toBe(
      cpz.UserPositionOrderStatus.closed
    );
    expect(userRobot.state.positions[0].entryExecuted).toBe(0.2);
    expect(userRobot.state.connectorJobs.length).toBe(0);
  });

  it("Should handle exit partial order", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: 0.5,
      remaining: 0.5
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].exitStatus).toBe(
      cpz.UserPositionOrderStatus.partial
    );
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.open
    );
    expect(userRobot.state.ordersToCreate[0].type).toBe(
      cpz.OrderType.forceMarket
    );
    expect(userRobot.state.ordersToCreate[0].volume).toBe(0.5);
  });

  it("Should handle exit partial order with slippage", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: 0.5,
      remaining: 0.5
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].exitStatus).toBe(
      cpz.UserPositionOrderStatus.partial
    );
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.open
    );
    expect(userRobot.state.ordersToCreate[0].type).toBe(cpz.OrderType.market);
    expect(userRobot.state.ordersToCreate[0].volume).toBe(0.5);
  });

  it("Should handle entry canceled order and cancel position", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.canceled,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString()
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.canceled
    );
    expect(userRobot.state.connectorJobs.length).toBe(0);
  });

  it("Should handle entry canceled order and recreate order", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.canceled,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString()
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    expect(userRobot.state.positions[0].internalState.entrySlippageCount).toBe(
      2
    );
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.new
    );
    expect(userRobot.state.connectorJobs.length).toBe(1);
    expect(userRobot.state.connectorJobs[0].type).toBe(
      cpz.OrderJobType.recreate
    );
    expect(userRobot.state.connectorJobs[0].data.price).toBe(5198);
  });

  it("Should cancel position after all slippage steps", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.canceled,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString()
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          internalState: {
            entrySlippageCount: 5,
            exitSlippageCount: 0
          },
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);

    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.canceled
    );
  });

  it("Should handle exit canceled order", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.canceled,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: 0,
      remaining: openOrder.volume
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.ordersToCreate.length).toBe(1);
    expect(userRobot.state.ordersToCreate[0].type).toBe(
      cpz.OrderType.forceMarket
    );
  });

  it("Should cancel position with canceled order in history", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.open,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: null,
      executed: 0,
      remaining: 0,
      nextJob: {
        type: cpz.OrderJobType.check
      }
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });

    const signalOpen2: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      candleTimestamp: dayjs.utc("2019-10-26T00:10:00.000Z").toISOString(),
      action: cpz.TradeAction.long,
      orderType: cpz.OrderType.market,
      price: 6000
    };
    userRobot.handleSignal(signalOpen2);

    expect(userRobot.state.connectorJobs[0].type).toBe(cpz.OrderJobType.cancel);
    const openOrderCanceled = {
      ...openOrder,
      status: cpz.OrderStatus.canceled,
      nextJob: null
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrderCanceled]
        },
        {
          ...userRobot.state.positions[1]
        }
      ]
    });
    userRobot.handleOrder(openOrderCanceled);

    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.canceled
    );
  });

  it("Should close position with exit canceled order in history", () => {
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      }
    });
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const canceledCloseOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.canceled,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: 0,
      remaining: openOrder.volume
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [canceledCloseOrder]
        }
      ]
    });
    userRobot.handleOrder(canceledCloseOrder);

    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: openOrder.volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          orderTimeout: 120
        }
      },
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [canceledCloseOrder, closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.closed
    );
  });

  it("Should create new position and close parent if open signal first", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalOpenNew: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T01:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      positionParentId: signalOpen.positionId,
      candleTimestamp: dayjs.utc("2019-10-26T01:10:00.000Z").toISOString(),
      action: cpz.TradeAction.long,
      orderType: cpz.OrderType.market,
      price: 7000
    };
    userRobot.handleSignal(signalOpenNew);
    expect(userRobot.state.positions.length).toBe(2);
    expect(userRobot.state.positions[0].exitAction).toBe(
      cpz.TradeAction.closeShort
    );
    expect(userRobot.state.positions[1].status).toBe(
      cpz.UserPositionStatus.new
    );
    expect(userRobot.state.connectorJobs.length).toBe(2);
    expect(userRobot.state.connectorJobs[0].type).toBe(cpz.OrderJobType.create);
    expect(userRobot.state.ordersToCreate[0].price).toBe(7702);
    expect(userRobot.state.connectorJobs[1].type).toBe(cpz.OrderJobType.create);
    expect(userRobot.state.ordersToCreate[1].price).toBe(7702);
  });

  it("Should create new position after close signal", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);
    const signalOpenNew: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T01:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      positionParentId: signalOpen.positionId,
      candleTimestamp: dayjs.utc("2019-10-26T01:10:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 7000
    };
    userRobot.handleSignal(signalOpenNew);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.open
    );
    expect(userRobot.state.positions.length).toBe(2);
    expect(userRobot.state.positions[1].status).toBe(
      cpz.UserPositionStatus.new
    );
  });

  it("Should cancel previous parent positions", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalOpen2: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T01:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      positionParentId: signalOpen.positionId,
      candleTimestamp: dayjs.utc("2019-10-26T01:10:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 7000
    };
    userRobot.handleSignal(signalOpen2);
    const signalOpenNew3: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T01:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_3",
      positionParentId: signalOpen2.positionId,
      candleTimestamp: dayjs.utc("2019-10-26T01:10:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 7000
    };
    userRobot.handleSignal(signalOpenNew3);
    expect(userRobot.state.positions.length).toBe(3);
    expect(userRobot.state.positions[0].nextJob).toBe(
      cpz.UserPositionJob.close
    );
    expect(userRobot.state.positions[1].nextJob).toBe(
      cpz.UserPositionJob.cancel
    );
    expect(userRobot.state.positions[2].status).toBe(
      cpz.UserPositionStatus.new
    );
  });

  it("Should process delayed position", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);
    const signalOpenNew: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T01:10:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_2",
      positionParentId: signalOpen.positionId,
      candleTimestamp: dayjs.utc("2019-10-26T01:10:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 7000
    };
    userRobot.handleSignal(signalOpenNew);
    const signalClose: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: signalOpen.positionId,
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.closeShort,
      orderType: cpz.OrderType.market,
      price: 5998
    };
    userRobot.handleSignal(signalClose);

    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        },
        {
          ...userRobot.state.positions[1]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions.length).toBe(2);
    expect(userRobot.state.positions[1].status).toBe(
      cpz.UserPositionStatus.new
    );
  });

  it("Should force close position after Robot stop", () => {
    const signalOpen: cpz.SignalEvent = {
      id: uuid(),
      robotId,
      exchange: "kraken",
      asset: "BTC",
      currency: "USD",
      timeframe: 5,
      timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
      type: cpz.SignalType.trade,
      positionId: uuid(),
      positionPrefix: "p",
      positionCode: "p_1",
      candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
      action: cpz.TradeAction.short,
      orderType: cpz.OrderType.market,
      price: 6500
    };

    userRobot.handleSignal(signalOpen);
    const openOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder]
        }
      ]
    });
    userRobot.handleOrder(openOrder);

    userRobot.stop();
    expect(userRobot.hasActivePositions).toBe(true);
    expect(userRobot.state.userRobot.status).toBe(cpz.Status.stopping);
    expect(userRobot.state.ordersToCreate.length).toBe(1);
    expect(userRobot.state.ordersToCreate[0].type).toBe(
      cpz.OrderType.forceMarket
    );
    expect(userRobot.state.ordersToCreate[0].action).toBe(
      cpz.TradeAction.closeShort
    );
    const closeOrder = {
      ...userRobot.state.ordersToCreate[0],
      status: cpz.OrderStatus.closed,
      exId: uuid(),
      exTimestamp: dayjs.utc().toISOString(),
      exLastTradeAt: dayjs.utc().toISOString(),
      executed: userRobot.state.ordersToCreate[0].volume,
      remaining: 0
    };
    userRobot = new UserRobot({
      ...userRobot.state.userRobot,
      robot,
      positions: [
        {
          ...userRobot.state.positions[0],
          entryOrders: [openOrder],
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.closedAuto
    );
    expect(userRobot.hasClosedPositions).toBe(true);
    expect(userRobot.hasActivePositions).toBe(false);
    if (
      userRobot.status === cpz.Status.stopping &&
      !userRobot.hasActivePositions
    )
      userRobot.setStop();
    expect(userRobot.state.userRobot.status).toBe(cpz.Status.stopped);
  });
});
