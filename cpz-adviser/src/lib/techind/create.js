import * as techind from "technicalindicators";
import ServiceError from "cpz/error";
import Log from "cpz/log";

function isNumeric(obj) {
  return !Array.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
}
const methods = {};

function execute(params) {
  try {
    const result = params.indicator.calculate({
      ...params.inputs,
      ...params.options
    });
    const results = {};
    Log.debug("result", result);
    if (result && Array.isArray(result) && result.length > 0) {
      params.results.forEach(resultName => {
        results[resultName] = result[result.length - 1][resultName];
      });
    } else {
      params.results.forEach(resultName => {
        results[resultName] = null;
      });
    }

    return results;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TECHIND_EXECUTION_ERROR,
        cause: error,
        info: {
          inputs: params.inputs,
          options: params.options,
          results: params.results
        }
      },
      'Failed to execute tech indicator "%s"',
      params.name
    );
  }
}

const verifyParams = (methodName, params) => {
  const requiredParams = methods[methodName].requires;

  requiredParams.forEach(paramName => {
    if (!Object.prototype.hasOwnProperty.call(params, paramName)) {
      throw new ServiceError(
        {
          name: ServiceError.types.TECHIND_VALIDATION_ERROR,
          info: {
            methodName,
            paramName
          }
        },
        `Can't configure tech indicator ${methodName} requires ${paramName}`
      );
    }

    const val = params[paramName];

    if (!isNumeric(val)) {
      throw new ServiceError(
        {
          name: ServiceError.types.TECHIND_VALIDATION_ERROR,
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

methods.adx = {
  requires: ["period"],
  create: params => {
    verifyParams("adx", params);

    return data =>
      execute({
        name: "adx",
        indicator: techind.ADX,
        inputs: { high: data.high, low: data.low, close: data.close },
        options: { period: params.period },
        results: ["adx", "mdi", "pdi"]
      });
  }
};

export default methods;
