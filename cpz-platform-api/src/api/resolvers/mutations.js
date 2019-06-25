import {
  insertExchangeAccount,
  updateExchangeAccount,
  deleteExchangeAccount
} from "./exchangeAccount";
import subscribeToBeta from "./betaSubscription";

const mutations = {
  insertExchangeAccount,
  updateExchangeAccount,
  deleteExchangeAccount,
  subscribeToBeta
};

export default mutations;
