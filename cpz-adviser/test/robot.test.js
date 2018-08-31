require("dotenv").config(); // ! ENVS NEEDED: EG_SIGNALS_TOPIC_KEY, EG_SIGNALS_TOPIC_ENDPOINT
const { expect } = require("chai");

const robotExecute = require("../robots/execute");

describe("Robot", () => {
  let context;
  let logs = [];
  beforeEach(async () => {
    context = {
      res: null,
      log: (...args) => {
        args.forEach(item => {
          logs.push(item);
        });
      },
      done: null
    };
  });

  afterEach(async () => {
    if (logs.length > 0) {
      console.log("Test logs:");
      logs.forEach(item => {
        console.log(item);
      });
    }
    logs = [];
  });

  const initialState = {
    id: "someUniqRobotId",
    name: "TEST_STRATEGY",
    exchange: "bitfinex",
    exchangeId: "someUniqExchangeId",
    baseq: "BTC",
    quote: "USD",
    timeframe: 1
  };

  it("Runs full robot iteration", async () => {
    const result = await robotExecute(context, initialState);
    console.log(result);
    expect(result.isSuccessful).to.be.equal(true);
  });
  it("Must throw can't find strategy Error", async () => {
    initialState.name = "RANDOM1234";
    const result = await robotExecute(context, initialState);
    console.log(result);
    expect(result.isSuccessful).to.be.equal(false);
  });
});
