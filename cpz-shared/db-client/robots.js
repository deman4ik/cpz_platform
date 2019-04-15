import ServiceError from "../error";
import DB from "./index";

async function getRobotDB(robotId) {
  try {
    const query = `query robot_by_pk($robotId: numeric!){
        cpz_robot_by_pk(id: $robotId){
          id
          exchange
          asset
          currency
          timeframe
          stratBystrat {
            filename
          }
          candlebatchersettings
          advisersettings
          tradersettings
        }
      }`;
    const variables = {
      robotId
    };
    const response = await DB.request(query, variables);
    if (response.cpz_robot_by_pk) {
      return {
        robotId: response.cpz_robot_by_pk.id,
        exchange: response.cpz_robot_by_pk.exchange,
        asset: response.cpz_robot_by_pk.asset,
        currency: response.cpz_robot_by_pk.currency,
        timeframe: response.cpz_robot_by_pk.timeframe,
        strategyName: response.cpz_robot_by_pk.stratBystrat.filename,
        candlebatcherSettings: response.cpz_robot_by_pk.candlebatchersettings,
        adviserSettings: response.cpz_robot_by_pk.advisersettings,
        traderSettings: response.cpz_robot_by_pk.tradersettings
      };
    }
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error,
        info: {
          robotId
        }
      },
      "Failed to query robot from DB;"
    );
  }
}

export { getRobotDB };
