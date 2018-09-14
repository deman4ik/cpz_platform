require("dotenv").config();
const { expect } = require("chai");
const { queueImportIteration } = require("../queueStorage");

describe("Importer message in Azure Queue Storage", () => {
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
  it("Creates new message in queue", async () => {
    const message = {
      rowKey: "12345",
      partitionKey: "Bitfinex/USD/BTC"
    };
    const result = await queueImportIteration(context, message);
    expect(result.isSuccess).to.be.equal(true);
  });
});
