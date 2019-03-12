import ServiceError from "../error";

function mapForDB(backtester) {
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

async function isBacktestExistsDB(id) {
  try {
    const query = `query backtest_by_id($id: uuid!){
  cpz_backtest_by_pk(id:$id){
    id
  }
}`;
    const response = await this.client.request(query, { id });

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
async function saveBacktestsDB(data) {
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
        objects: data.map(backtester => mapForDB(backtester))
      };
    } else {
      variables = {
        objects: [mapForDB(data)]
      };
    }

    await this.client.request(query, variables);
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
    await this.client.request(query, { id });
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
export { isBacktestExistsDB, saveBacktestsDB, deleteBacktestDB };
