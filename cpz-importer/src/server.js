import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import Log from "cpz/log";
import { checkEnvVars } from "cpz/utils/environment";
import importerEnv from "cpz/config/environment/importer";
import handleTaskEvents from "./routes/taskEvents";
import { handlingEventsByType, checkAuth, validateEvents } from "./middleware";
import init from "./init";

checkEnvVars(importerEnv.variables);
init();
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
