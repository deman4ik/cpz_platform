import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { checkEnvVars } from "cpz/utils/environment";
import { sleep } from "cpz/utils/helpers";
import marketwatcherEnv from "cpz/config/environment/marketwatcher";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import handleTaskEvents from "./routes/taskEvents";
import checkAlive from "./checkAlive";
import { checkAuth, handlingEventsByType, validateEvents } from "./middleware";
import config from "./config";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: config.serviceName
});
checkEnvVars(marketwatcherEnv.variables);

ServiceValidator.add(config.events.schemas);

const server = express();

server.use(helmet());
server.use(bodyParser.json());

// Routes
server.get("/", (req, res) => res.status(200).end());
server.post(
  "/api/taskEvents",
  checkAuth,
  handlingEventsByType,
  validateEvents,
  handleTaskEvents
);

// Run server
const PORT = process.env.NODE_PORT || process.env.PORT || 8102;
server.listen(PORT, err => {
  if (err) throw err;
  Log.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
});

/* eslint-disable no-await-in-loop, no-constant-condition */
(async () => {
  while (true) {
    await checkAlive();
    await sleep(20000);
  }
})();
/* no-await-in-loop, no-constant-condition */
