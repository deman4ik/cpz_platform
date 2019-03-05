import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import Log from "cpzLog";
import { BACKTESTER_SERVICE } from "cpzServices";
import { checkEnvVars } from "cpzUtils/environment";
import backtesterEnv from "cpzEnv/backtester";
import handleTaskEvents from "./routes/taskEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: BACKTESTER_SERVICE
});
checkEnvVars(backtesterEnv.variables);

const run = () => {
  const server = express();

  server.use(helmet());
  server.use(bodyParser.json());
  server.post("/api/taskEvents", (req, res) => handleTaskEvents(req, res));

  const PORT = process.env.NODE_PORT || process.env.PORT || 8108;
  server.listen(PORT, err => {
    if (err) throw err;
    Log.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
  });
};

run();
