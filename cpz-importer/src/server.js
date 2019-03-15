import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import Log from "cpz/log";
import { checkEnvVars } from "cpz/utils/environment";
import importerEnv from "cpz/config/environment/importer";
import ServiceValidator from "cpz/validator";
import handleTaskEvents from "./routes/taskEvents";
import config from "./config";
import { handlingEventsByType, checkAuth, validateEvents } from "./middleware";

// Setup Log
Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: config.serviceName
});

// Setup ServiceValidator
ServiceValidator.add(config.events.schemas);

checkEnvVars(importerEnv.variables);

const server = express();

server.use(helmet());
server.use(bodyParser.json());
server.get("/", (req, res) => res.status(200).end());
server.post(
  "/api/taskEvents",
  checkAuth,
  handlingEventsByType,
  validateEvents,
  handleTaskEvents
);

const PORT = process.env.NODE_PORT || process.env.PORT || 8105;
server.listen(PORT, err => {
  if (err) throw err;
  Log.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
});
