import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import Log from "cpzLog";
import { IMPORTER_SERVICE } from "cpzServices";
import { checkEnvVars } from "cpzUtils/environment";
import importerEnv from "cpzEnv/importer";
import handleTaskEvents from "./routes/taskEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: IMPORTER_SERVICE
});

checkEnvVars(importerEnv.variables);

const run = () => {
  const server = express();

  server.use(helmet());
  server.use(bodyParser.json());
  server.get("/", (req, res) => res.status(200).end());
  server.post("/api/taskEvents", (req, res) => handleTaskEvents(req, res));

  const PORT = process.env.NODE_PORT || process.env.PORT || 8105;
  server.listen(PORT, err => {
    if (err) throw err;
    Log.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
  });
};

run();
