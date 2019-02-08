import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { checkEnvVars } from "cpzUtils/environment";
import backtesterEnv from "cpzEnv/backtester";
import handleTaskEvents from "./routes/taskEvents";

checkEnvVars(backtesterEnv.variables);

const run = () => {
  const server = express();

  server.use(helmet());
  server.use(bodyParser.json());
  server.post("/api/taskEvents", (req, res) => handleTaskEvents(req, res));

  const PORT = process.env.NODE_PORT || process.env.PORT || 8108;
  server.listen(PORT, err => {
    if (err) throw err;
    console.info(`> Ready on http://localhost:${PORT}/api/taskEvents`);
  });
};

run();
