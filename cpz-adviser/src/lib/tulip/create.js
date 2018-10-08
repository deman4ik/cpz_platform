/* from https://github.com/askmike/gekko/ */
import tulind from "tulind";
import VError from "verror";

function isNumeric(obj) {
  return !Array.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
}
const methods = {};
// Wrapper that executes a tulip indicator
async function execute(params) {
  try {
    const result = await params.indicator.indicator(
      params.inputs,
      params.options
    );
    const results = {};
    for (let i = 0; i < params.results.length; i += 1) {
      if (Array.isArray(result[i])) {
        const arr = result[i];
        results[params.results[i]] = arr[arr.length - 1];
      } else {
        results[params.results[i]] = result[i];
      }
    }
    return results;
  } catch (error) {
    throw new VError(
      {
        name: "TulipExecuteError",
        cause: error,
        info: {
          params
        }
      },
      'Failed to execute Tulip indicator "%s"',
      params.indicator.indicator
    );
  }
}

// Helper that makes sure all required parameters
// for a specific talib indicator are present.
const verifyParams = (methodName, params) => {
  const requiredParams = methods[methodName].requires;

  requiredParams.forEach(paramName => {
    if (!Object.prototype.hasOwnProperty.call(params, paramName)) {
      throw new VError(
        {
          name: "ValidationError",
          info: {
            methodName,
            paramName
          }
        },
        `Can't configure tulip ${methodName} requires ${paramName}`
      );
    }

    const val = params[paramName];

    if (!isNumeric(val)) {
      throw new VError(
        {
          name: "ValidationError",
          info: {
            methodName,
            paramName
          }
        },
        `Can't configure tulip ${methodName} - ${paramName} needs to be a number`
      );
    }
  });
};

methods.ad = {
  requires: [],
  create: params => {
    verifyParams("ad", params);

    return data =>
      execute({
        indicator: tulind.indicators.ad,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [],
        results: ["result"]
      });
  }
};

methods.adosc = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("adosc", params);

    return data =>
      execute({
        indicator: tulind.indicators.adosc,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
  }
};

methods.adx = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("adx", params);

    return data =>
      execute({
        indicator: tulind.indicators.adx,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.adxr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("adxr", params);

    return data =>
      execute({
        indicator: tulind.indicators.adxr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.ao = {
  requires: [],
  create: params => {
    verifyParams("ao", params);

    return data =>
      execute({
        indicator: tulind.indicators.ao,
        inputs: [data.high, data.low],
        options: [],
        results: ["result"]
      });
  }
};

methods.apo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("apo", params);

    return data =>
      execute({
        indicator: tulind.indicators.apo,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
  }
};

methods.aroon = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("aroon", params);

    return data =>
      execute({
        indicator: tulind.indicators.aroon,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["aroonDown", "aroonUp"]
      });
  }
};

methods.aroonosc = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("aroonosc", params);

    return data =>
      execute({
        indicator: tulind.indicators.aroonosc,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.atr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("atr", params);

    return data =>
      execute({
        indicator: tulind.indicators.atr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.avgprice = {
  requires: [],
  create: params => {
    verifyParams("avgprice", params);

    return data =>
      execute({
        indicator: tulind.indicators.avgprice,
        inputs: [data.open, data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.bbands = {
  requires: ["optInTimePeriod", "optInNbStdDevs"],
  create: params => {
    verifyParams("bbands", params);

    return data =>
      execute({
        indicator: tulind.indicators.bbands,
        inputs: [data.close],
        options: [params.optInTimePeriod, params.optInNbStdDevs],
        results: ["bbandsLower", "bbandsMiddle", "bbandsUpper"]
      });
  }
};

methods.bop = {
  requires: [],
  create: params => {
    verifyParams("bop", params);

    return data =>
      execute({
        indicator: tulind.indicators.bop,
        inputs: [data.open, data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.cci = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("cci", params);

    return data =>
      execute({
        indicator: tulind.indicators.cci,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.cmo = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("cmo", params);

    return data =>
      execute({
        indicator: tulind.indicators.cmo,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.cvi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("cvi", params);

    return data =>
      execute({
        indicator: tulind.indicators.cvi,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.dema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dema", params);

    return data =>
      execute({
        indicator: tulind.indicators.dema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.di = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("di", params);

    return data =>
      execute({
        indicator: tulind.indicators.di,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["diPlus", "diMinus"]
      });
  }
};

methods.dm = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dm", params);

    return data =>
      execute({
        indicator: tulind.indicators.dm,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["dmPlus", "dmLow"]
      });
  }
};

methods.dpo = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dpo", params);

    return data =>
      execute({
        indicator: tulind.indicators.dpo,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.dx = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dx", params);

    return data =>
      execute({
        indicator: tulind.indicators.dx,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.ema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("ema", params);

    return data =>
      execute({
        indicator: tulind.indicators.ema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.emv = {
  requires: [],
  create: params => {
    verifyParams("emv", params);

    return data =>
      execute({
        indicator: tulind.indicators.emv,
        inputs: [data.high, data.low, data.volume],
        options: [params.optInTimePeriod],
        results: []
      });
  }
};

methods.fisher = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("fisher", params);

    return data =>
      execute({
        indicator: tulind.indicators.fisher,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["fisher", "fisherPeriod"]
      });
  }
};

methods.fosc = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("fosc", params);

    return data =>
      execute({
        indicator: tulind.indicators.fosc,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.hma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("hma", params);

    return data =>
      execute({
        indicator: tulind.indicators.hma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.kama = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("kama", params);

    return data =>
      execute({
        indicator: tulind.indicators.kama,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.kvo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("kvo", params);

    return data =>
      execute({
        indicator: tulind.indicators.kvo,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
  }
};

methods.linreg = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linreg", params);

    return data =>
      execute({
        indicator: tulind.indicators.linreg,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.linregintercept = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linregintercept", params);

    return data =>
      execute({
        indicator: tulind.indicators.linregintercept,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.linregslope = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linregslope", params);

    return data =>
      execute({
        indicator: tulind.indicators.linregslope,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.macd = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInSignalPeriod"],
  create: params => {
    verifyParams("macd", params);

    return data =>
      execute({
        indicator: tulind.indicators.macd,
        inputs: [data.close],
        options: [
          params.optInFastPeriod,
          params.optInSlowPeriod,
          params.optInSignalPeriod
        ],
        results: ["macd", "macdSignal", "macdHistogram"]
      });
  }
};

methods.marketfi = {
  requires: [],
  create: params => {
    verifyParams("marketfi", params);

    return data =>
      execute({
        indicator: tulind.indicators.marketfi,
        inputs: [data.high, data.low, data.volume],
        options: [],
        results: ["result"]
      });
  }
};

methods.mass = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("mass", params);

    return data =>
      execute({
        indicator: tulind.indicators.mass,
        inputs: [data.high, data.low],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.medprice = {
  requires: [],
  create: params => {
    verifyParams("medprice", params);

    return data =>
      execute({
        indicator: tulind.indicators.medprice,
        inputs: [data.high, data.low],
        options: [],
        results: ["result"]
      });
  }
};

methods.mfi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("mfi", params);

    return data =>
      execute({
        indicator: tulind.indicators.mfi,
        inputs: [data.high, data.low, data.close, data.volume],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.msw = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("msw", params);

    return data =>
      execute({
        indicator: tulind.indicators.msw,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["mswSine", "mswLead"]
      });
  }
};

methods.natr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("natr", params);

    return data =>
      execute({
        indicator: tulind.indicators.natr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.nvi = {
  requires: [],
  create: params => {
    verifyParams("nvi", params);

    return data =>
      execute({
        indicator: tulind.indicators.nvi,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
  }
};

methods.obv = {
  requires: [],
  create: params => {
    verifyParams("obv", params);

    return data =>
      execute({
        indicator: tulind.indicators.obv,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
  }
};

methods.ppo = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("ppo", params);

    return data =>
      execute({
        indicator: tulind.indicators.ppo,
        inputs: [data.close],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
  }
};

methods.psar = {
  requires: ["optInAcceleration", "optInMaximum"],
  create: params => {
    verifyParams("psar", params);

    return data =>
      execute({
        indicator: tulind.indicators.psar,
        inputs: [data.high, data.low],
        options: [params.optInAcceleration, params.optInMaximum],
        results: ["result"]
      });
  }
};

methods.pvi = {
  requires: [],
  create: params => {
    verifyParams("pvi", params);

    return data =>
      execute({
        indicator: tulind.indicators.pvi,
        inputs: [data.close, data.volume],
        options: [],
        results: ["result"]
      });
  }
};

methods.qstick = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("qstick", params);

    return data =>
      execute({
        indicator: tulind.indicators.qstick,
        inputs: [data.open, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.roc = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("roc", params);

    return data =>
      execute({
        indicator: tulind.indicators.roc,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.rocr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rocr", params);

    return data =>
      execute({
        indicator: tulind.indicators.rocr,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.rsi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rsi", params);

    return data =>
      execute({
        indicator: tulind.indicators.rsi,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.sma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("sma", params);

    return data =>
      execute({
        indicator: tulind.indicators.sma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.stddev = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("stddev", params);

    return data =>
      execute({
        indicator: tulind.indicators.stddev,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.stoch = {
  requires: ["optInFastKPeriod", "optInSlowKPeriod", "optInSlowDPeriod"],
  create: params => {
    verifyParams("stoch", params);

    return data =>
      execute({
        indicator: tulind.indicators.stoch,
        inputs: [data.high, data.low, data.close],
        options: [
          params.optInFastKPeriod,
          params.optInSlowKPeriod,
          params.optInSlowDPeriod
        ],
        results: ["stochK", "stochD"]
      });
  }
};

methods.sum = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("sum", params);

    return data =>
      execute({
        indicator: tulind.indicators.sum,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.tema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("tema", params);

    return data =>
      execute({
        indicator: tulind.indicators.tema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.tr = {
  requires: [],
  create: params => {
    verifyParams("tr", params);

    return data =>
      execute({
        indicator: tulind.indicators.tr,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.trima = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("trima", params);

    return data =>
      execute({
        indicator: tulind.indicators.trima,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.trix = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("trix", params);

    return data =>
      execute({
        indicator: tulind.indicators.trix,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.tsf = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("tsf", params);

    return data =>
      execute({
        indicator: tulind.indicators.tsf,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.typprice = {
  requires: [],
  create: params => {
    verifyParams("typprice", params);

    return data =>
      execute({
        indicator: tulind.indicators.typprice,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.ultosc = {
  requires: ["optInTimePeriod1", "optInTimePeriod2", "optInTimePeriod3"],
  create: params => {
    verifyParams("ultosc", params);

    return data =>
      execute({
        indicator: tulind.indicators.ultosc,
        inputs: [data.high, data.low, data.close],
        options: [
          params.optInTimePeriod1,
          params.optInTimePeriod2,
          params.optInTimePeriod3
        ],
        results: ["result"]
      });
  }
};

methods.vhf = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("vhf", params);

    return data =>
      execute({
        indicator: tulind.indicators.vhf,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.vidya = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInAlpha"],
  create: params => {
    verifyParams("vidya", params);

    return data =>
      execute({
        indicator: tulind.indicators.vidya,
        inputs: [data.close],
        options: [
          params.optInFastPeriod,
          params.optInSlowPeriod,
          params.optInAlpha
        ],
        results: ["result"]
      });
  }
};

methods.volatility = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("volatility", params);

    return data =>
      execute({
        indicator: tulind.indicators.volatility,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.vosc = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("vosc", params);

    return data =>
      execute({
        indicator: tulind.indicators.vosc,
        inputs: [data.volume],
        options: [params.optInFastPeriod, params.optInSlowPeriod],
        results: ["result"]
      });
  }
};

methods.vwma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("vwma", params);

    return data =>
      execute({
        indicator: tulind.indicators.vwma,
        inputs: [data.close, data.volume],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.wad = {
  requires: [],
  create: params => {
    verifyParams("wad", params);

    return data =>
      execute({
        indicator: tulind.indicators.wad,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.wcprice = {
  requires: [],
  create: params => {
    verifyParams("wcprice", params);

    return data =>
      execute({
        indicator: tulind.indicators.wcprice,
        inputs: [data.high, data.low, data.close],
        options: [],
        results: ["result"]
      });
  }
};

methods.wilders = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("wilders", params);

    return data =>
      execute({
        indicator: tulind.indicators.wilders,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.willr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("willr", params);

    return data =>
      execute({
        indicator: tulind.indicators.willr,
        inputs: [data.high, data.low, data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.wma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("wma", params);

    return data =>
      execute({
        indicator: tulind.indicators.wma,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

methods.zlema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("zlema", params);

    return data =>
      execute({
        indicator: tulind.indicators.zlema,
        inputs: [data.close],
        options: [params.optInTimePeriod],
        results: ["result"]
      });
  }
};

export default methods;
