/* import fs from "fs";
import path from "path";
import VError from "verror"; */

const fs = require("fs");
const path = require("path");
const VError = require("verror");
const Adviser = require("../adviser/adviser");

// TODO: Привести имена ошибок в соответсвии с cpz-shared/config/state/errorTypes
class IndicatorTester {
  constructor(name) {
    this.name = name || "";
  }

  // Проверяем, что индикатор сохранен и мы можем получить его код
  isIndicatorExist() {
    return new Promise(resolve => {
      const location = path.resolve(__dirname, `../indicators/${this.name}.js`);
      fs.access(location, fs.constants.F_OK, err => {
        if (err) {
          resolve(false);
          throw new VError(
            {
              name: "Indicator doesn't exist"
            },
            "Cannot find indicator in directory",
            this.name
          );
        } else {
          resolve(true);
        }
      });
    });
  }

  // Проверяем, что индикатор имеет нужную структуру
  isCorrectStructure() {
    let result = false;
    const location = path.resolve(__dirname, `../indicators/${this.name}.js`);
    // eslint-disable-next-line
    const indicator = require(location);
    if (typeof indicator !== "object") {
      throw new VError(
        {
          name: "Indicator structure error"
        },
        "Indicator should be an object"
      );
    } else if (!Object.prototype.hasOwnProperty.call(indicator, "init")) {
      throw new VError(
        {
          name: "Indicator structure error"
        },
        "Indicator should have init property"
      );
    } else if (!Object.prototype.hasOwnProperty.call(indicator, "calc")) {
      throw new VError(
        {
          name: "Indicator structure error"
        },
        "Indicator should have calc property"
      );
    } else if (typeof indicator.init !== "function") {
      throw new VError(
        {
          name: "Indicator structure error"
        },
        "Indicator init prop should be function"
      );
    } else if (typeof indicator.calc !== "function") {
      throw new VError(
        {
          name: "Indicator structure error"
        },
        "Indicator calc prop should be function"
      );
    } else result = true;
    return result;
  }

  initIndicator() {
    const adviser = new Adviser();
    console.log(adviser);
  }
}

module.exports = IndicatorTester;
