import ServiceError from "../error";
import DB from "./index";

const getEventAction = eventType =>
  eventType
    .split(".")
    .pop()
    .toString()
    .toLowerCase();

async function saveUserRobotHistDB(data) {
  try {
    const query = `mutation saveUserRobotHist($objects: [cpz_user_robothist_insert_input!]!) {
        insert_cpz_user_robothist(objects: $objects){
          affected_rows
        }
      }`;

    const variables = {
      objects: data.map(hist => ({
        user_robot_id: hist.id,
        action_date: hist.eventTime,
        action: getEventAction(hist.eventType), // TODO stopped user/auto
        run_mode: hist.traderSettings.mode,
        advisersettings: hist.adviserSettings,
        tradersettings: hist.traderSettings,
        candlebatchersettings: hist.candlebatcherSettings,
        error: hist.error
      }))
    };

    await DB.request(query, variables);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save user robot history to DB"
    );
  }
}

export { saveUserRobotHistDB };
