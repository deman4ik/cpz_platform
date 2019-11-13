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

    expect(userRobot.state.ordersWithJobs.length).toBe(1);
    expect(userRobot.state.ordersWithJobs[0].nextJob.type).toBe(
      cpz.OrderJobType.cancel
    );
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
          exitOrders: [closeOrder]
        }
      ]
    });
    userRobot.handleOrder(closeOrder);
    expect(userRobot.state.positions[0].status).toBe(
      cpz.UserPositionStatus.closed
    );
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
    expect(userRobot.state.ordersWithJobs.length).toBe(0);
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
    expect(userRobot.state.ordersWithJobs.length).toBe(1);
    expect(userRobot.state.ordersWithJobs[0].nextJob.type).toBe(
      cpz.OrderJobType.recreate
    );
    expect(userRobot.state.ordersWithJobs[0].nextJob.data.price).toBe(5198);
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

  it("Should create new delayed position", () => {
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
    expect(userRobot.state.positions.length).toBe(2);
    expect(userRobot.state.positions[1].status).toBe(
      cpz.UserPositionStatus.delayed
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
});
