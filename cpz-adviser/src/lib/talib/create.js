/*import talib from "talib";
import ServiceError from "cpz/error";
import Log from "cpz/log";

function isNumeric(obj) {
  return !Array.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
}
const methods = {};

function execute(params) {
  return new Promise((resolve, reject) => {
    talib.execute(params, (err, result) => {
      if (err) {
        reject(
          new ServiceError(
            {
              name: ServiceError.types.TALIB_EXECUTION_ERROR,
              cause: err,
              info: {
                params
              }
            },
            'Failed to execute Talib indicator "%s"',
            params.name
          )
        );
        return;
      }
      const results = {};
      if (result.result) {
        Object.keys(result.result).forEach(resultName => {
          const arr = result.result[resultName];
          if (arr && Array.isArray(arr) && arr.length > 0) {
            results[resultName] = arr[arr.length - 1];
          } else if (arr && !Array.isArray(arr)) {
            results[resultName] = result.result[resultName];
          } else {
            results[resultName] = null;
          }
        });
      } else {
        results.result = null;
      }

      resolve(results);
    });
  });
}

const verifyParams = (methodName, params) => {
  const requiredParams = methods[methodName].requires;

  requiredParams.forEach(paramName => {
    if (!Object.prototype.hasOwnProperty.call(params, paramName)) {
      throw new ServiceError(
        {
          name: ServiceError.types.TALIB_VALIDATION_ERROR,
          info: {
            methodName,
            paramName
          }
        },
        `Can't configure talib ${methodName} requires ${paramName}`
      );
    }

    const val = params[paramName];

    if (!isNumeric(val)) {
      throw new ServiceError(
        {
          name: ServiceError.types.TALIB_VALIDATION_ERROR,
          info: {
            methodName,
            paramName
          }
        },
        `Can't configure talib ${methodName} - ${paramName} needs to be a number`
      );
    }
  });
};

methods.cdl2crows = {
  requires: [],
  create: params => {
    verifyParams("cdl2crows", params);
    return data =>
      execute({
        name: "CDL2CROWS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3blackcrows = {
  requires: [],
  create: params => {
    verifyParams("cdl3blackcrows", params);
    return data =>
      execute({
        name: "CDL3BLACKCROWS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3inside = {
  requires: [],
  create: params => {
    verifyParams("cdl3inside", params);
    return data =>
      execute({
        name: "CDL3INSIDE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3linestrike = {
  requires: [],
  create: params => {
    verifyParams("cdl3linestrike", params);
    return data =>
      execute({
        name: "CDL3LINESTRIKE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3outside = {
  requires: [],
  create: params => {
    verifyParams("cdl3outside", params);
    return data =>
      execute({
        name: "CDL3OUTSIDE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3starsinsouth = {
  requires: [],
  create: params => {
    verifyParams("cdl3starsinsouth", params);
    return data =>
      execute({
        name: "CDL3STARSINSOUTH",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdl3whitesoldiers = {
  requires: [],
  create: params => {
    verifyParams("cdl3whitesoldiers", params);
    return data =>
      execute({
        name: "CDL3WHITESOLDIERS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlabandonedbaby = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdlabandonedbaby", params);
    return data =>
      execute({
        name: "CDLABANDONEDBABY",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdladvanceblock = {
  requires: [],
  create: params => {
    verifyParams("cdladvanceblock", params);
    return data =>
      execute({
        name: "CDLADVANCEBLOCK",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlbelthold = {
  requires: [],
  create: params => {
    verifyParams("cdlbelthold", params);
    return data =>
      execute({
        name: "CDLBELTHOLD",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlbreakaway = {
  requires: [],
  create: params => {
    verifyParams("cdlbreakaway", params);
    return data =>
      execute({
        name: "CDLBREAKAWAY",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlclosingmarubozu = {
  requires: [],
  create: params => {
    verifyParams("cdlclosingmarubozu", params);
    return data =>
      execute({
        name: "CDLCLOSINGMARUBOZU",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlconcealbabyswall = {
  requires: [],
  create: params => {
    verifyParams("cdlconcealbabyswall", params);
    return data =>
      execute({
        name: "CDLCONCEALBABYSWALL",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlcounterattack = {
  requires: [],
  create: params => {
    verifyParams("cdlcounterattack", params);
    return data =>
      execute({
        name: "CDLCOUNTERATTACK",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdldarkcloudcover = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdldarkcloudcover", params);
    return data =>
      execute({
        name: "CDLDARKCLOUDCOVER",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdldoji = {
  requires: [],
  create: params => {
    verifyParams("cdldoji", params);
    return data =>
      execute({
        name: "CDLDOJI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdldojistar = {
  requires: [],
  create: params => {
    verifyParams("cdldojistar", params);
    return data =>
      execute({
        name: "CDLDOJISTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdldragonflydoji = {
  requires: [],
  create: params => {
    verifyParams("cdldragonflydoji", params);
    return data =>
      execute({
        name: "CDLDRAGONFLYDOJI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlengulfing = {
  requires: [],
  create: params => {
    verifyParams("cdlengulfing", params);
    return data =>
      execute({
        name: "CDLENGULFING",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdleveningdojistar = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdleveningdojistar", params);
    return data =>
      execute({
        name: "CDLEVENINGDOJISTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdleveningstar = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdleveningstar", params);
    return data =>
      execute({
        name: "CDLEVENINGSTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdlgapsidesidewhite = {
  requires: [],
  create: params => {
    verifyParams("cdlgapsidesidewhite", params);
    return data =>
      execute({
        name: "CDLGAPSIDESIDEWHITE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlgravestonedoji = {
  requires: [],
  create: params => {
    verifyParams("cdlgravestonedoji", params);
    return data =>
      execute({
        name: "CDLGRAVESTONEDOJI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhammer = {
  requires: [],
  create: params => {
    verifyParams("cdlhammer", params);
    return data =>
      execute({
        name: "CDLHAMMER",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhangingman = {
  requires: [],
  create: params => {
    verifyParams("cdlhangingman", params);
    return data =>
      execute({
        name: "CDLHANGINGMAN",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlharami = {
  requires: [],
  create: params => {
    verifyParams("cdlharami", params);
    return data =>
      execute({
        name: "CDLHARAMI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlharamicross = {
  requires: [],
  create: params => {
    verifyParams("cdlharamicross", params);
    return data =>
      execute({
        name: "CDLHARAMICROSS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhighwave = {
  requires: [],
  create: params => {
    verifyParams("cdlhighwave", params);
    return data =>
      execute({
        name: "CDLHIGHWAVE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhikkake = {
  requires: [],
  create: params => {
    verifyParams("cdlhikkake", params);
    return data =>
      execute({
        name: "CDLHIKKAKE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhikkakemod = {
  requires: [],
  create: params => {
    verifyParams("cdlhikkakemod", params);
    return data =>
      execute({
        name: "CDLHIKKAKEMOD",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlhomingpigeon = {
  requires: [],
  create: params => {
    verifyParams("cdlhomingpigeon", params);
    return data =>
      execute({
        name: "CDLHOMINGPIGEON",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlidentical3crows = {
  requires: [],
  create: params => {
    verifyParams("cdlidentical3crows", params);
    return data =>
      execute({
        name: "CDLIDENTICAL3CROWS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlinneck = {
  requires: [],
  create: params => {
    verifyParams("cdlinneck", params);
    return data =>
      execute({
        name: "CDLINNECK",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlinvertedhammer = {
  requires: [],
  create: params => {
    verifyParams("cdlinvertedhammer", params);
    return data =>
      execute({
        name: "CDLINVERTEDHAMMER",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlkicking = {
  requires: [],
  create: params => {
    verifyParams("cdlkicking", params);
    return data =>
      execute({
        name: "CDLKICKING",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlkickingbylength = {
  requires: [],
  create: params => {
    verifyParams("cdlkickingbylength", params);
    return data =>
      execute({
        name: "CDLKICKINGBYLENGTH",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlladderbottom = {
  requires: [],
  create: params => {
    verifyParams("cdlladderbottom", params);
    return data =>
      execute({
        name: "CDLLADDERBOTTOM",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdllongleggeddoji = {
  requires: [],
  create: params => {
    verifyParams("cdllongleggeddoji", params);
    return data =>
      execute({
        name: "CDLLONGLEGGEDDOJI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdllongline = {
  requires: [],
  create: params => {
    verifyParams("cdllongline", params);
    return data =>
      execute({
        name: "CDLLONGLINE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlmarubozu = {
  requires: [],
  create: params => {
    verifyParams("cdlmarubozu", params);
    return data =>
      execute({
        name: "CDLMARUBOZU",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlmatchinglow = {
  requires: [],
  create: params => {
    verifyParams("cdlmatchinglow", params);
    return data =>
      execute({
        name: "CDLMATCHINGLOW",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlmathold = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdlmathold", params);
    return data =>
      execute({
        name: "CDLMATHOLD",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdlmorningdojistar = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdlmorningdojistar", params);
    return data =>
      execute({
        name: "CDLMORNINGDOJISTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdlmorningstar = {
  requires: ["optInPenetration"],
  create: params => {
    verifyParams("cdlmorningstar", params);
    return data =>
      execute({
        name: "CDLMORNINGSTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        optInPenetration: params.optInPenetration
      });
  }
};
methods.cdlonneck = {
  requires: [],
  create: params => {
    verifyParams("cdlonneck", params);
    return data =>
      execute({
        name: "CDLONNECK",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlpiercing = {
  requires: [],
  create: params => {
    verifyParams("cdlpiercing", params);
    return data =>
      execute({
        name: "CDLPIERCING",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlrickshawman = {
  requires: [],
  create: params => {
    verifyParams("cdlrickshawman", params);
    return data =>
      execute({
        name: "CDLRICKSHAWMAN",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlrisefall3methods = {
  requires: [],
  create: params => {
    verifyParams("cdlrisefall3methods", params);
    return data =>
      execute({
        name: "CDLRISEFALL3METHODS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlseparatinglines = {
  requires: [],
  create: params => {
    verifyParams("cdlseparatinglines", params);
    return data =>
      execute({
        name: "CDLSEPARATINGLINES",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlshootingstar = {
  requires: [],
  create: params => {
    verifyParams("cdlshootingstar", params);
    return data =>
      execute({
        name: "CDLSHOOTINGSTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlshortline = {
  requires: [],
  create: params => {
    verifyParams("cdlshortline", params);
    return data =>
      execute({
        name: "CDLSHORTLINE",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlspinningtop = {
  requires: [],
  create: params => {
    verifyParams("cdlspinningtop", params);
    return data =>
      execute({
        name: "CDLSPINNINGTOP",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlstalledpattern = {
  requires: [],
  create: params => {
    verifyParams("cdlstalledpattern", params);
    return data =>
      execute({
        name: "CDLSTALLEDPATTERN",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlsticksandwich = {
  requires: [],
  create: params => {
    verifyParams("cdlsticksandwich", params);
    return data =>
      execute({
        name: "CDLSTICKSANDWICH",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdltakuri = {
  requires: [],
  create: params => {
    verifyParams("cdltakuri", params);
    return data =>
      execute({
        name: "CDLTAKURI",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdltasukigap = {
  requires: [],
  create: params => {
    verifyParams("cdltasukigap", params);
    return data =>
      execute({
        name: "CDLTASUKIGAP",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlthrusting = {
  requires: [],
  create: params => {
    verifyParams("cdlthrusting", params);
    return data =>
      execute({
        name: "CDLTHRUSTING",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdltristar = {
  requires: [],
  create: params => {
    verifyParams("cdltristar", params);
    return data =>
      execute({
        name: "CDLTRISTAR",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlunique3river = {
  requires: [],
  create: params => {
    verifyParams("cdlunique3river", params);
    return data =>
      execute({
        name: "CDLUNIQUE3RIVER",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlupsidegap2crows = {
  requires: [],
  create: params => {
    verifyParams("cdlupsidegap2crows", params);
    return data =>
      execute({
        name: "CDLUPSIDEGAP2CROWS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};
methods.cdlxsidegap3methods = {
  requires: [],
  create: params => {
    verifyParams("cdlxsidegap3methods", params);
    return data =>
      execute({
        name: "CDLXSIDEGAP3METHODS",
        startIdx: 0,
        endIdx: data.close.length - 1,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
      });
  }
};

//////////////////////////////Pattern Recognition//////////////////////////////

methods.accbands = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("accbands", params);

    return data =>
      execute({
        name: "ACCBANDS",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ad = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("accbands", params);

    return data =>
      execute({
        name: "AD",
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.adosc = {
  requires: ["optInFastPeriod", "optInSlowPeriod"],
  create: params => {
    verifyParams("adosc", params);

    return data =>
      execute({
        name: "ADOSC",
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInFastPeriod: params.optInFastPeriod,
        optInSlowPeriod: params.optInSlowPeriod
      });
  }
};

methods.adx = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("adx", params);

    return data =>
      execute({
        name: "ADX",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.adxr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("adxr", params);

    return data =>
      execute({
        name: "ADXR",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.apo = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInMAType"],
  create: params => {
    verifyParams("apo", params);

    return data =>
      execute({
        name: "APO",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.length - 1,
        optInFastPeriod: params.optInFastPeriod,
        optInSlowPeriod: params.optInSlowPeriod,
        optInMAType: params.optInMAType
      });
  }
};

methods.aroon = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("aroon", params);

    return data =>
      execute({
        name: "AROON",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.aroonosc = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("aroonosc", params);

    return data =>
      execute({
        name: "AROONOSC",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.atr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("atr", params);

    return data =>
      execute({
        name: "ATR",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.avgprice = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("avgprice", params);

    return data =>
      execute({
        name: "AVGPRICE",
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.open.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.bbands = {
  requires: ["optInTimePeriod", "optInNbDevUp", "optInNbDevDn", "optInMAType"],
  create: params => {
    verifyParams("bbands", params);

    return data =>
      execute({
        name: "BBANDS",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod,
        optInNbDevUp: params.optInNbDevUp,
        optInNbDevDn: params.optInNbDevDn,
        optInMAType: params.optInMAType
      });
  }
};

///////////////////////////////////////////////////////////////

// this.beta = function(data_0, data_1, period) {
//     return talibWrapper({
//         name: "BETA",
//         inReal0: data_0,
//         inReal1: data_1,
//         startIdx: 0,
//         endIdx: data_0.length - 1,
//         optInTimePeriod: period
//     });
// };

methods.bop = {
  requires: [],
  create: params => {
    verifyParams("bop", params);

    return data =>
      execute({
        name: "BOP",
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1
      });
  }
};

methods.cci = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("cci", params);

    return data =>
      execute({
        name: "CCI",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.cmo = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("cmo", params);

    return data =>
      execute({
        name: "CMO",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

// this.correl = function(data_0, data_1, period) {
//     return talibWrapper({
//         name: "CORREL",
//         inReal0: data_0,
//         inReal1: data_1,
//         startIdx: 0,
//         endIdx: data_0.length - 1,
//         optInTimePeriod: period
//     });
// };

methods.dema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dema", params);

    return data =>
      execute({
        name: "DEMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.dx = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("dx", params);

    return data =>
      execute({
        name: "DX",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("ema", params);

    return data =>
      execute({
        name: "EMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ht_dcperiod = {
  requires: [],
  create: params => {
    verifyParams("ht_dcperiod", params);

    return data =>
      execute({
        name: "HT_DCPERIOD",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.ht_dcphase = {
  requires: [],
  create: params => {
    verifyParams("ht_dcphase", params);

    return data =>
      execute({
        name: "HT_DCPHASE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.ht_phasor = {
  requires: [],
  create: params => {
    verifyParams("ht_phasor", params);

    return data =>
      execute({
        name: "HT_PHASOR",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.ht_sine = {
  requires: [],
  create: params => {
    verifyParams("ht_sine", params);

    return data =>
      execute({
        name: "HT_SINE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.ht_trendline = {
  requires: [],
  create: params => {
    verifyParams("ht_trendline", params);

    return data =>
      execute({
        name: "HT_TRENDLINE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.ht_trendmode = {
  requires: [],
  create: params => {
    verifyParams("ht_trendmode", params);

    return data =>
      execute({
        name: "HT_TRENDMODE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.imi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("imi", params);

    return data =>
      execute({
        name: "IMI",
        open: data.open,
        close: data.close,
        startIdx: 0,
        endIdx: data.open.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.kama = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("kama", params);

    return data =>
      execute({
        name: "KAMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.linearreg = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linearreg", params);

    return data =>
      execute({
        name: "LINEARREG",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.linearreg_angle = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linearreg_angle", params);

    return data =>
      execute({
        name: "LINEARREG_ANGLE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.linearreg_intercept = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linearreg_intercept", params);

    return data =>
      execute({
        name: "LINEARREG_INTERCEPT",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.linearreg_slope = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("linearreg_slope", params);

    return data =>
      execute({
        name: "LINEARREG_SLOPE",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ma = {
  requires: ["optInTimePeriod", "optInMAType"],
  create: params => {
    verifyParams("ma", params);

    return data =>
      execute({
        name: "MA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod,
        optInMAType: params.optInMAType
      });
  }
};

methods.macd = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInSignalPeriod"],
  create: params => {
    verifyParams("macd", params);

    return data =>
      execute({
        name: "MACD",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInFastPeriod: params.optInFastPeriod,
        optInSlowPeriod: params.optInSlowPeriod,
        optInSignalPeriod: params.optInSignalPeriod
      });
  }
};

methods.macdext = {
  requires: [
    "optInFastPeriod",
    "optInFastMAType",
    "optInSlowPeriod",
    "optInSlowMAType",
    "optInSignalPeriod",
    "optInSignalMAType"
  ],
  create: params => {
    verifyParams("macdext", params);

    return data =>
      execute({
        name: "MACDEXT",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInFastPeriod: params.optInFastPeriod,
        optInFastMAType: params.optInFastMAType,
        optInSlowPeriod: params.optInSlowPeriod,
        optInSlowMAType: params.optInSlowMAType,
        optInSignalPeriod: params.optInSignalPeriod,
        optInSignalMAType: params.optInSignalMAType
      });
  }
};

methods.macdfix = {
  requires: ["optInSignalPeriod"],
  create: params => {
    verifyParams("macdfix", params);

    return data =>
      execute({
        name: "MACDFIX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInSignalPeriod: params.optInSignalPeriod
      });
  }
};

methods.mama = {
  requires: ["optInFastLimit", "optInSlowLimit"],
  create: params => {
    verifyParams("mama", params);

    return data =>
      execute({
        name: "MAMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInFastLimit: params.optInFastLimit,
        optInSlowLimit: params.optInSlowLimit
      });
  }
};

methods.mavp = {
  requires: ["inPeriods", "optInMinPeriod", "optInMaxPeriod", "optInMAType"],
  create: params => {
    verifyParams("mavp", params);

    return data =>
      execute({
        name: "MAVP",
        inReal: data.close,
        inPeriods: params.inPeriods,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInMinPeriod: params.optInMinPeriod,
        optInMaxPeriod: params.optInMaxPeriod,
        optInMAType: params.optInMAType
      });
  }
};

methods.max = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("max", params);

    return data =>
      execute({
        name: "MAX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.maxindex = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("maxindex", params);

    return data =>
      execute({
        name: "MAXINDEX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.medprice = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("medprice", params);

    return data =>
      execute({
        name: "MEDPRICE",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.mfi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("mfi", params);

    return data =>
      execute({
        name: "MFI",
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.midpoint = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("midpoint", params);

    return data =>
      execute({
        name: "MIDPOINT",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.midprice = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("midprice", params);

    return data =>
      execute({
        name: "MIDPRICE",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.min = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("min", params);

    return data =>
      execute({
        name: "MIN",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.minindex = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("minindex", params);

    return data =>
      execute({
        name: "MININDEX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.minmax = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("minmax", params);

    return data =>
      execute({
        name: "MINMAX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.minmaxindex = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("minmaxindex", params);

    return data =>
      execute({
        name: "MINMAXINDEX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.minus_di = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("minus_di", params);

    return data =>
      execute({
        name: "MINUS_DI",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.minus_dm = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("minus_dm", params);

    return data =>
      execute({
        name: "MINUS_DM",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.mom = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("mom", params);

    return data =>
      execute({
        name: "MOM",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.natr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("natr", params);

    return data =>
      execute({
        name: "NATR",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.obv = {
  requires: [],
  create: params => {
    verifyParams("obv", params);

    return data =>
      execute({
        name: "OBV",
        inReal: data.close,
        volume: data.volume,
        startIdx: 0,
        endIdx: data.close.length - 1
      });
  }
};

methods.plus_di = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("plus_di", params);

    return data =>
      execute({
        name: "PLUS_DI",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.plus_dm = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("plus_dm", params);

    return data =>
      execute({
        name: "PLUS_DM",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ppo = {
  requires: ["optInFastPeriod", "optInSlowPeriod", "optInMAType"],
  create: params => {
    verifyParams("ppo", params);

    return data =>
      execute({
        name: "PPO",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInFastPeriod: params.optInFastPeriod,
        optInSlowPeriod: params.optInSlowPeriod,
        optInMAType: params.optInMAType
      });
  }
};

methods.roc = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("roc", params);

    return data =>
      execute({
        name: "ROC",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.rocp = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rocp", params);

    return data =>
      execute({
        name: "ROCP",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.rocr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rocr", params);

    return data =>
      execute({
        name: "ROCR",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.rocr100 = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rocr100", params);

    return data =>
      execute({
        name: "ROCR100",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.rsi = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("rsi", params);

    return data =>
      execute({
        name: "RSI",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.sar = {
  requires: ["optInAcceleration", "optInMaximum"],
  create: params => {
    verifyParams("sar", params);

    return data =>
      execute({
        name: "SAR",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInAcceleration: params.optInAcceleration,
        optInMaximum: params.optInMaximum
      });
  }
};

methods.sarext = {
  requires: [
    "optInStartValue",
    "optInOffsetOnReverse",
    "optInAccelerationInitLong",
    "optInAccelerationLong",
    "optInAccelerationMaxLong",
    "optInAccelerationInitShort",
    "optInAccelerationShort",
    "optInAccelerationMaxShort"
  ],
  create: params => {
    verifyParams("sarext", params);

    return data =>
      execute({
        name: "SAREXT",
        high: data.high,
        low: data.low,
        startIdx: 0,
        endIdx: data.high.length - 1,

        optInStartValue: params.optInStartValue,
        optInOffsetOnReverse: params.optInOffsetOnReverse,
        optInAccelerationInitLong: params.optInAccelerationInitLong,
        optInAccelerationLong: params.optInAccelerationLong,
        optInAccelerationMaxLong: params.optInAccelerationMaxLong,
        optInAccelerationInitShort: params.optInAccelerationInitShort,
        optInAccelerationShort: params.optInAccelerationShort,
        optInAccelerationMaxShort: params.optInAccelerationMaxShort
      });
  }
};

methods.sma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("sma", params);

    return data =>
      execute({
        name: "SMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.stddev = {
  requires: ["optInTimePeriod", "optInNbDev"],
  create: params => {
    verifyParams("stddev", params);

    return data =>
      execute({
        name: "STDDEV",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod,
        optInNbDev: params.optInNbDev
      });
  }
};

methods.stoch = {
  requires: [
    "optInFastK_Period",
    "optInSlowK_Period",
    "optInSlowK_MAType",
    "optInSlowD_Period",
    "optInSlowD_MAType"
  ],
  create: params => {
    verifyParams("stoch", params);

    return data =>
      execute({
        name: "STOCH",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,

        optInFastK_Period: params.optInFastK_Period,
        optInSlowK_Period: params.optInSlowK_Period,
        optInSlowK_MAType: params.optInSlowK_MAType,
        optInSlowD_Period: params.optInSlowD_Period,
        optInSlowD_MAType: params.optInSlowD_MAType
      });
  }
};

methods.stochf = {
  requires: ["optInFastK_Period", "optInFastD_Period", "optInFastD_MAType"],
  create: params => {
    verifyParams("stochf", params);

    return data =>
      execute({
        name: "STOCHF",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,

        optInFastK_Period: params.optInFastK_Period,
        optInFastD_Period: params.optInFastD_Period,
        optInFastD_MAType: params.optInFastD_MAType
      });
  }
};

methods.stochrsi = {
  requires: [
    "optInTimePeriod",
    "optInFastK_Period",
    "optInFastD_Period",
    "optInFastD_MAType"
  ],
  create: params => {
    verifyParams("stochrsi", params);

    return data =>
      execute({
        name: "STOCHRSI",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,

        optInTimePeriod: params.optInTimePeriod,
        optInFastK_Period: params.optInFastK_Period,
        optInFastD_Period: params.optInFastD_Period,
        optInFastD_MAType: params.optInFastD_MAType
      });
  }
};

methods.t3 = {
  requires: [
    "optInTimePeriod",
    "optInFastK_Period",
    "optInFastD_Period",
    "optInFastD_MAType"
  ],
  create: params => {
    verifyParams("t3", params);

    return data =>
      execute({
        name: "T3",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod,
        optInVFactor: params.optInVFactor
      });
  }
};

methods.tema = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("tema", params);

    return data =>
      execute({
        name: "TEMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.trange = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("trange", params);

    return data =>
      execute({
        name: "TRANGE",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.trima = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("trima", params);

    return data =>
      execute({
        name: "TRIMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.trix = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("trix", params);

    return data =>
      execute({
        name: "TRIX",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.tsf = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("tsf", params);

    return data =>
      execute({
        name: "TSF",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.typprice = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("typprice", params);

    return data =>
      execute({
        name: "TYPPRICE",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.ultosc = {
  requires: ["optInTimePeriod1", "optInTimePeriod2", "optInTimePeriod3"],
  create: params => {
    verifyParams("ultosc", params);

    return data =>
      execute({
        name: "ULTOSC",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod1: params.optInTimePeriod1,
        optInTimePeriod2: params.optInTimePeriod2,
        optInTimePeriod3: params.optInTimePeriod3
      });
  }
};

methods.variance = {
  requires: ["optInTimePeriod", "optInNbDev"],
  create: params => {
    verifyParams("variance", params);

    return data =>
      execute({
        name: "VAR",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod,
        optInNbDev: params.optInTimePeriod
      });
  }
};

methods.wclprice = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("wclprice", params);

    return data =>
      execute({
        name: "WCLPRICE",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.willr = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("willr", params);

    return data =>
      execute({
        name: "WILLR",
        high: data.high,
        low: data.low,
        close: data.close,
        startIdx: 0,
        endIdx: data.high.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

methods.wma = {
  requires: ["optInTimePeriod"],
  create: params => {
    verifyParams("wma", params);

    return data =>
      execute({
        name: "WMA",
        inReal: data.close,
        startIdx: 0,
        endIdx: data.close.length - 1,
        optInTimePeriod: params.optInTimePeriod
      });
  }
};

export default methods;
*/
