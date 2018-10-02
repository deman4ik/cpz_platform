class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.stack = new Error().stack;
    this.name = this.constructor.name;
  }
}

class CPZError extends ExtendableError {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

module.exports = CPZError;
