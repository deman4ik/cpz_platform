import BaseIndicator from "../../state/baseIndicator";
import techind from "./create";

class Tech extends BaseIndicator {
  constructor(state) {
    super(state);
    this.calculate = techind[state.indicatorName].create(state.options);
  }

  calc() {
    const { candlesLength } = this.options;
    const candlesProps = this.prepareCandles(
      this.candles.slice(-candlesLength)
    );
    const result = this.calculate(candlesProps);
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

export default Tech;
