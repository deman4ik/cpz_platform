const { stringify: str } = JSON;

/**
 * @param {String} key methodname
 */
function logQuery(key) {
  return function out(content) {
    if (!this[key].cache) this[key].cache = [];
    this[key].cache.push(content);

    // For chain requests
    // Exmaple - res.status(200).send("Hello")
    return this;
  };
}

function logMock() {
  return {
    info: logQuery("info"),
    error: logQuery("error"),
    warn: logQuery("warn")
  };
}

/**
 * @returns {*} mock for context
 */
function contextMock() {
  return {
    log: logMock(),
    done() {
      this.done.called = true;
    }
  };
}

function resMock() {
  return {
    send: logQuery("send"),
    status: logQuery("status"),
    end: logQuery("end"),
    error: logQuery("error")
  };
}

/**
 * @param {any[]} body
 * @param {*} query
 */
function reqMock(body, query = { "api-key": process.env.API_KEY }) {
  const rawBody = str(body);

  return {
    query,
    body,
    rawBody
  };
}

export { logQuery, contextMock, reqMock, resMock, logMock };
