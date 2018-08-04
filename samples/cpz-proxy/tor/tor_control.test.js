const renewTorSession = require("./tor_controler");

test("renewTorSession", async () => {
  // VG
  jest.setTimeout(12000);
  const result = await renewTorSession();
  expect(result).toBeDefined();
});
