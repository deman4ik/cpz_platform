import BaseIndicator from "../../state/robot/robotIndicator";
import tulip from "./create";
import { cpz } from "../../@types";

class Tulip extends BaseIndicator {
  calculate: (props: {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  }) => { [key: string]: number };

  constructor(state: cpz.IndicatorState) {
    super(state);
    this._parametersSchema = {
      candlesLength: {
        description: "Candles window length",
        type: "number",
        integer: "true",
        positive: "true",
        min: 1,
        max: this._robotSettings.requiredHistoryMaxBars || 1,
        optional: true
      }
    };
    tulip[this._indicatorName].requires.forEach(param => {
      this._parametersSchema[param] = {
        description: param,
        type: "number"
      };
    });
    this.calculate = tulip[this._indicatorName].create(this.parameters);
  }

  async calc() {
    const { candlesLength } = this.parameters;
    const candlesProps = this.prepareCandles(
      this.candles.slice(-candlesLength)
    );
    const result = await this.calculate(candlesProps);
    const resultKeys = Object.keys(result);
    if (resultKeys.length > 0) {
      resultKeys.forEach((key: string) => {
        this[key] = result[key];
      });
    } else {
      this.result = null;
    }
  }
}

export = Tulip;
