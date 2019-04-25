import checkAuth from "./middleware/checkAuth";
import handlingEventsByTypes from "./middleware/handlingEventsByTypes";
import { EGConfig, ValidatorConfig } from "../utils/helpers";

class BaseService {
  checkAuth(context, req) {
    return checkAuth(context, req);
  }

  handlingEventsByTypes(context, req, neededEvents) {
    return handlingEventsByTypes(context, req, neededEvents);
  }

  ValidatorConfig(schemasList) {
    return ValidatorConfig(schemasList);
  }

  EGConfig(topics) {
    return EGConfig(topics);
  }
}

export default BaseService;
