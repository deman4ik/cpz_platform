import VError from "verror";
import db from "./db";

async function saveUserRobotHistDB(data) {
  try {
    const query = `mutation saveUserRobotHist($objects: [cpz_user_robothist_insert_input!]!) {
        insert_cpz_user_robothist(objects: $objects){
          affected_rows
        }
      }`;

    /* eslint-disable no-restricted-syntax, no-await-in-loop */

    const variables = {
      objects: data.map(hist => ({
        user_robot_id: hist.id,
        action_date: hist.eventTime,
        action:
          hist.eventType.split(".").pop() === "Started" ? "start" : "stop_user", // TODO
        run_mode: hist.traderSettings.mode,
        // user_params: hist.userParams, //TODO
        advisersettings: hist.adviserSettings,
        tradersettings: hist.traderSettings,
        candlebatchersettings: hist.candlebatcherSettings
      }))
    };

    await db.request(query, variables);
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error
      },
      "Failed to save user robot history to DB"
    );
  }
}

export { saveUserRobotHistDB };
