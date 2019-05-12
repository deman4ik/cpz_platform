import ServiceError from "../error";
import DB from "./index";

function mapBacktestDataForDB(backtester) {
  return {
    id: backtester.taskId,
    user_id: backtester.userId,
    robot_id: backtester.robotId,
    exchange: backtester.exchange,
    asset: backtester.asset,
    currency: backtester.currency,
    timeframe: backtester.timeframe,
    dt_from: backtester.dateFrom,
    dt_to: backtester.dateTo,
    status: backtester.status,
    started_at: backtester.startedAt,
    ended_at: backtester.endedAt,
    total_bars: backtester.totalBars,
    processed_bars: backtester.processedBars,
    advisersettings: backtester.adviserSettings,
    tradersettings: backtester.traderSettings,
    note: backtester.eventSubject
  };
}

function mapBacktestWLDataForDB(backtest) {
  return {
    id: backtest.backtestId,
    dt_from: backtest.dateFrom,
    dt_to: backtest.dateTo,
    settings: backtest.settings
  };
}

async function isBacktestExistsDB(id) {
  try {
    const query = `query backtest_by_id($id: uuid!){
  cpz_backtest_by_pk(id:$id){
    id
  }
}`;
    const response = await DB.client.request(query, { id });

    return response && response.cpz_backtest_by_pk;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error,
        info: {
          id
        }
      },
      "Failed to find backtest in DB"
    );
  }
}

async function isBacktestWLExistsDB(id) {
  try {
    const query = `query backtest_wl_by_id($id: uuid!){
      cpz_backtest_wl_by_pk(id: $id) {
        id
      }
    }`;
    const response = await DB.client.request(query, { id });

    return response && response.cpz_backtest_wl_by_pk;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error,
        info: {
          id
        }
      },
      "Failed to find backtest WL in DB"
    );
  }
}

async function saveBacktestDB(data) {
  try {
    const query = `mutation insert_backtest($objects: [cpz_backtest_insert_input!]!){
      insert_cpz_backtest(objects:$objects,
      on_conflict: {
        constraint: c_backtest_pk
        update_columns: [ended_at, processed_bars, status]
      }){
        affected_rows
      }
    }`;

    /* eslint-disable no-restricted-syntax, no-await-in-loop */

    let variables;
    if (Array.isArray(data)) {
      variables = {
        objects: data.map(backtester => mapBacktestDataForDB(backtester))
      };
    } else {
      variables = {
        objects: [mapBacktestDataForDB(data)]
      };
    }

    await DB.client.request(query, variables);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save backtest to DB"
    );
  }
}

async function saveBacktestWLDB(data) {
  try {
    const query = `mutation insert_backtest_wl($objects: [cpz_backtest_wl_insert_input!]!) {
      insert_cpz_backtest_wl(objects: $objects, on_conflict: {constraint: c_backtest_wl_pk, update_columns: [dt_from, dt_to, settings]}) {
        affected_rows
      }
    }
    `;

    /* eslint-disable no-restricted-syntax, no-await-in-loop */

    let variables;
    if (Array.isArray(data)) {
      variables = {
        objects: data.map(backtest => mapBacktestWLDataForDB(backtest))
      };
    } else {
      variables = {
        objects: [mapBacktestWLDataForDB(data)]
      };
    }

    await DB.client.request(query, variables);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save backtest WL to DB"
    );
  }
}

async function deleteBacktestDB(id) {
  try {
    const query = `mutation delete_backtest($id: uuid!){
      delete_cpz_backtest(where:{
        id: {
          _eq: $id
        }
      }){
        affected_rows
      }
    }`;
    await DB.client.request(query, { id });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error,
        info: {
          id
        }
      },
      "Failed to delete backtest in DB"
    );
  }
}

async function deleteBacktestWLDB(id) {
  try {
    const query = `mutation delete_backtestWL($id: uuid!){
      delete_cpz_backtest_wl(where:{
        id: {
          _eq: $id
        }
      }){
        affected_rows
      }
    }`;
    await DB.client.request(query, { id });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error,
        info: {
          id
        }
      },
      "Failed to delete backtest WL in DB"
    );
  }
}
export {
  isBacktestExistsDB,
  saveBacktestDB,
  deleteBacktestDB,
  isBacktestWLExistsDB,
  saveBacktestWLDB,
  deleteBacktestWLDB
};
