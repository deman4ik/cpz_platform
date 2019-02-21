const { stringify: str } = JSON;

/**
 * @param {String} key methodname
 */
function logQuery(key) {
  return function out(content) {
    if (!this[key].cache) this[key].cache = [];
    this[key].cache.push(content);
  };
}

/**
 * @returns {*} mock for context
 */
function contextMock() {
  return {
    log: {
      info: logQuery("info"),
      error: logQuery("error"),
      warn: logQuery("warn")
    },
    done() {
      this.done.called = true;
    }
  };
}

/**
 * @param {any[]} body
 * @param {*} query
 */
function reqMock(body, query = { "api-key": process.env.API_KEY }) {
  body = str(body);

  return {
    query,
    body,
    rawBody: body
  };
}

export { logQuery, contextMock, reqMock };
