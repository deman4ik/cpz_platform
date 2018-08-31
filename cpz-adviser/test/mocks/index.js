const util = require("util");

function getContextObject() {
  class Log {
    constructor(...args) {
      console.log(util.format(args));
    }
    error(...args) {
      console.error(util.format(args));
    }
  }
  const context = {
    res: null,
    log: new Log(),
    done: null
  };

  return context;
}

module.exports = { getContextObject };
