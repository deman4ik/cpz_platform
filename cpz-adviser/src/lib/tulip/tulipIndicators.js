import BaseIndicator from "../../state/baseIndicator";
import tulip from "./create";

class Tulip extends BaseIndicator {
  constructor(state) {
    super(state);

    this.calculate = tulip[state.indicatorName].create(state.options);
  }

  async calc() {
    this.log("CALC");
    const result = await this.calculate(this.candlesProps);
    this.log("result", result);
    const resultKeys = Object.keys(result);
    if (resultKeys.length > 0) {
      resultKeys.forEach(key => {
        this[key] = result[key];
      });
    } else {
      this.result = result;
    }
    this.log("this.result", this.result);
  }
}

export default Tulip;
