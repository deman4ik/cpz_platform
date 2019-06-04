import { v4 as uuid } from "uuid";
import ServiceError from "../error";
import DB from "./index";

async function saveUserExchaccDB({ name, exchange, userId, keys }) {
  try {
    const query = `mutation insertUserExchacc($objects: [cpz_user_exchacc_insert_input!]!) {
        insert_cpz_user_exchacc(objects: $objects){
          affected_rows
        }
      }`;

    const variables = {
      objects: [
        {
          id: uuid(),
          user_id: userId,
          name,
          exchange,
          keys
        }
      ]
    };

    await DB.client.request(query, variables);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save user exchange account to DB"
    );
  }
}

export { saveUserExchaccDB };
