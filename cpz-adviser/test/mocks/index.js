const util = require("util");

function getContextObject() {
  function log(...args) {
    console.log(util.format(args));
  }

  log.prototype.error = (...args) => {
    console.error(util.format(args));
  };

  log.prototype.info = (...args) => {
    console.log(util.format(args));
  };

  log.prototype.warn = (...args) => {
    console.log(util.format(args));
  };

  const context = {
    res: null,
    log,
    done: null
  };

  return context;
}

module.exports = { getContextObject };
