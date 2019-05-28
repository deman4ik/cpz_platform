import { json2csvAsync } from "json-2-csv";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import {
  isBacktestWLExistsDB,
  saveBacktestWLDB,
  deleteBacktestWLDB
} from "cpz/db-client/backtests";
import { savePositionsWLDB } from "cpz/db-client/positions";
import { BACKTESTER_LOGS } from "cpz/blobStorage/containers";
import { generateInvertedKey } from "cpz/utils/helpers";
import {
  getBacktestWLLogs,
  saveBacktestWLLogs,
  deleteBacktestWLState
} from "cpz/tableStorage-client/backtest/backtesters";

async function handleWLBacktest(req, res) {
  try {
    const { data, type } = req.body;
    if (type === "backtest") {
      if (data) {
        const { backtestId } = data;
        const exists = await isBacktestWLExistsDB(backtestId);
        if (exists) {
          await deleteBacktestWLDB(backtestId);
          await deleteBacktestWLState(backtestId);
        }
        await saveBacktestWLDB(data);
        Log.debug(`WL backtest ${backtestId} header saved`);
      }
    } else if (type === "positions") {
      if (data && Array.isArray(data) && data.length > 0) {
        await savePositionsWLDB(data);
        Log.debug(`WL backtest ${data[0].backtestId} positions saved`);
      }
    } else if (type === "logs") {
      if (data && Array.isArray(data) && data.length > 0) {
        const { backtestId } = data[0];

        const logs = data.map(log => ({
          ...log,
          PartitionKey: log.backtestId,
          RowKey: generateInvertedKey()
        }));
        await saveBacktestWLLogs(logs);

        const allLogsData = await getBacktestWLLogs(backtestId);
        const allLogs = allLogsData.map(log => {
          const logData = log;

          delete logData.RowKey;
          delete logData.PartitionKey;
          delete logData.Timestamp;
          delete logData.metadata;
          delete logData[".metadata"];
          Object.keys(logData).forEach(key => {
            if (key.toLowerCase().includes("timestamp")) {
              logData[key] = logData[key].toISOString();
            }
          });
          return logData;
        });
        const logsCSV = await json2csvAsync(allLogs);
        await BlobStorageClient.upload(
          BACKTESTER_LOGS,
          `${backtestId}_WLLogs.csv`,
          logsCSV
        );
        Log.debug(`WL backtest ${backtestId} logs saved`);
      }
    } else {
      Log.warn("Unknown type", type);
    }
    res.status(200).end();
  } catch (e) {
    Log.exception(e);
    res.status(500).send(e);
  }
  Log.clearContext();
}

export default handleWLBacktest;
