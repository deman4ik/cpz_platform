import BaseIndicator from "../../state/baseIndicator";
import techind from "./create";

class Tech extends BaseIndicator {
  constructor(state) {
    super(state);

    this._parametersSchema = {
      candlesLength: {
        description: "Candles window length",
        type: "number",
        integer: "true",
        positive: "true",
        min: 1,
        max: this._adviserSettings.requiredHistoryMaxBars || 1,
        optional: true
      }
    };
    techind[this._indicatorName].requires.forEach(param => {
      this._parametersSchema[param] = {
        description: param,
        type: "number"
      };
    });
  }

  init() {
    this.calculate = techind[this._indicatorName].create(this.parameters);
  }

  calc() {
    const { candlesLength } = this.parameters;
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
