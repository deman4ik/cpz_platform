require("dotenv").config(); // ! ENVS NEEDED: AZURE_STORAGE_CONNECTION_STRING
const { expect } = require("chai");
const util = require("util");
const { getContextObject } = require("./mocks");
const Robot = require("../robots/robot");
const { entityToObject, objectToEntity } = require("../tableStorage/utils");
const { saveState, getState } = require("../tableStorage");
const { createRobotSlug } = require("../robots/utils");

describe("Adviser State in Azure Table Storage", () => {
  let context;
  const logs = [];
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
    name: "Robot#1",
    exchange: "bitfinex",
    exchangeId: "someUniqExchangeId",
    baseq: "BTC",
    quote: "USD",
    timeframe: 1
  };

  it("Creates new Adviser state", async () => {
    const state = new Robot(context, initialState).getCurrentState();
    const result = await saveState(context, state);
    console.log(result);

    expect(result.isSuccessful).to.be.equal(true);
  });

  it("Gets Advisers state by slug", async () => {
    const slug = createRobotSlug(
      initialState.exchange,
      initialState.baseq,
      initialState.quote,
      initialState.timeframe
    );
    const result = await getState(context, slug);
    console.log(result);
    expect(result).to.be.a("Array");
  });
});
