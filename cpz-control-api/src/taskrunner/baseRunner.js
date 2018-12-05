const notImplemented = new Error("Not implemented exception");

class BaseRunner {
  static async start() {
    throw notImplemented;
  }

  static async stop() {
    throw notImplemented;
  }

  static async update() {
    throw notImplemented;
  }
}

export default BaseRunner;
