import { getBalance } from "./balance";
import { checkOrder } from "./order";

const queries = {
  order: checkOrder,
  balance: getBalance
};

export default queries;
