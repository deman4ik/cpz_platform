import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { checkEnvVars } from "cpzUtils/environment";
import { sleep } from "cpzUtils/helpers";
import marketwatcherEnv from "cpzEnv/marketwatcher";
import Log from "cpzUtils/log";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import handleTaskEvents from "./routes/taskEvents";
import checkAlive from "./checkAlive";

Log.setService(MARKETWATCHER_SERVICE);
checkEnvVars(marketwatcherEnv.variables);

const run = async () => {
  const server = express();

  server.use(helmet());
  server.use(bodyParser.json());
  server.post("/api/taskEvents", (req, res) => handleTaskEvents(req, res));

  const PORT = process.env.NODE_PORT || process.env.PORT || 8102;
  server.listen(PORT, err => {
    if (err) throw err;
    Log.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
  });

  /* eslint-disable no-await-in-loop, no-constant-condition */
  while (true) {
    await checkAlive();
    await sleep(20000);
  }
  /* no-await-in-loop, no-constant-condition */
};

run();
