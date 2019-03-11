import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import Log from "cpzLog";
import { BACKTESTER_SERVICE } from "cpzServices";
import { checkEnvVars } from "cpzUtils/environment";
import backtesterEnv from "cpzEnv/backtester";
import { v4 as uuid } from "uuid";
import handleTaskEvents from "./routes/taskEvents";
import checkAuth from "./middleware/checkAuth";
import handlingEventsByType from "./middleware/handlingEventsByType";
import validateEvents from "./middleware/validateEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: BACKTESTER_SERVICE
});
checkEnvVars(backtesterEnv.variables);

const server = express();

server.use(helmet());
server.use(bodyParser.json());

Log.addContext({
  executionContext: {
    invocationId: uuid(),
    functionName: "taskEvents"
  }
});
server.get("/", (req, res) => res.status(200).end());
server.post(
  "/api/taskEvents",
  checkAuth,
  handlingEventsByType,
  validateEvents,
  handleTaskEvents
);

const PORT = process.env.NODE_PORT || process.env.PORT || 8108;
server.listen(PORT, err => {
  if (err) throw err;
  Log.info(`Ready on http://localhost:${PORT}/api/taskEvents`);
});
