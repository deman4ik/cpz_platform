import VError from "verror";
import db from "./db";

async function getUserRobotDB(userRobotId) {
  try {
    const query = `query user_robot_by_pk($userRobotId: uuid!){
  cpz_user_robot_by_pk(id: $userRobotId){
    id
    run_mode
    user_id
    user_params
    quantity
    robotByrobotId {
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
  }
}`;
    const variables = {
      userRobotId
    };
    const response = await db.request(query, variables);
    if (response.cpz_user_robot_by_pk) {
      const { robotByrobotId } = response.cpz_user_robot_by_pk;
      return {
        id: response.cpz_user_robot_by_pk.id,
        userId: response.cpz_user_robot_by_pk.user_id,
        robotId: robotByrobotId.id,
        exchange: robotByrobotId.exchange,
        asset: robotByrobotId.asset,
        currency: robotByrobotId.currency,
        timeframe: robotByrobotId.timeframe,
        strategyName: robotByrobotId.stratBystrat.filename,
        candlebatcherSettings:
          response.cpz_user_robot_by_pk.candlebatchersettings,
        adviserSettings: response.cpz_user_robot_by_pk.advisersettings,
        traderSettings: {
          ...response.cpz_user_robot_by_pk.tradersettings,
          mode: response.cpz_user_robot_by_pk.run_mode
        }
      };
    }
    return null;
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error,
        info: {
          userRobotId
        }
      },
      "Failed to query user robot from DB;"
    );
  }
}

export { getUserRobotDB };
