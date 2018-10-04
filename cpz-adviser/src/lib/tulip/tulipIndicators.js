import BaseIndicator from "../../adviser/baseIndicator";
import tulip from "./create";

class Tulip extends BaseIndicator {
  constructor(state) {
    super(state);

    this.calculate = tulip[state.indicatorName].create(state.options);
  }

  async calc() {
    try {
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
    } catch (error) {
      this._context.log.error(error);
      throw error;
    }
  }
}

export default Tulip;
