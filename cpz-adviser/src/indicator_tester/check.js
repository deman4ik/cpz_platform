/*import IndicatorTester from "./index";*/
const IndicatorTester = require("./index");

const Tester = new IndicatorTester("SMA");

(async () => {
  console.log(await Tester.initIndicator());
})();
