const os = require("os");
const PromiseSocket = require("promise-socket");

const TorControlPort = {
  password: "cryptuoso",
  // host: "23.102.33.112",
  // port: 9051,

  /**
   * @param {Array.<string>} commands - array of commands to send to the ControlPort
   * */
  send: async commands => {
    try {
      const socket = new PromiseSocket();
      socket.setTimeout(5000);
      await socket.connect({
        host: TorControlPort.host || "localhost",
        port: TorControlPort.port || 9051
      });
      const commandString = `${commands.join("\n")}\n`;
      await socket.write(commandString);
      const response = await socket.readAll();

      if (response) {
        console.info(response.toString());
        return response;
      }

      await socket.end();
    } catch (e) {
      console.error("Connection error:", e);
    }
  }
};

/**
 * send a predefined set of commands to the ControlPort
 * to request a new tor session.
 */
const renewTorSession = async () => {
  const password = TorControlPort.password || "";
  const commands = [
    `authenticate "${password}"`, // authenticate the connection
    "signal newnym", // send the signal (renew Tor session)
    "quit" // close the connection
  ];

  const result = await TorControlPort.send(commands);

  const lines = result
    .toString()
    .split(os.EOL)
    .slice(0, -1);

  const success = lines.every(
    val =>
      // each response from the ControlPort should start with 250 (OK STATUS)
      val.length <= 0 || val.indexOf("250") >= 0
  );
  return success;
};

module.exports = renewTorSession;
