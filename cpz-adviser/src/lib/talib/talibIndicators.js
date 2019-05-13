/*import BaseIndicator from "../../state/baseIndicator";
import talib from "./create";

class Talib extends BaseIndicator {
  constructor(state) {
    super(state);
    this.calculate = talib[state.indicatorName].create(state.options);
  }

  async calc() {
    const { candlesLength } = this.options;
    const candlesProps = this.prepareCandles(
      this.candles.slice(-candlesLength)
    );
    const result = await this.calculate(candlesProps);
    const resultKeys = Object.keys(result);
    if (resultKeys.length > 0) {
      resultKeys.forEach(key => {
        this[key] = result[key];
      });
    } else {
      this.result = result;
    }
  }
}

export default Talib;
*/
