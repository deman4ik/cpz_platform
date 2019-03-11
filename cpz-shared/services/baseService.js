import checkAuth from "./middleware/checkAuth";
import validateEvents from "./middleware/validateEvents";
import handlingEventsByTypes from "./middleware/handlingEventsByTypes";

class BaseService {
  checkAuth(context, req) {
    return checkAuth(context, req);
  }

  handlingEventsByTypes(context, req, neededEvents) {
    return handlingEventsByTypes(context, req, neededEvents);
  }

  validateEvents(events, schema) {
    return validateEvents(events, schema);
  }
}

export default BaseService;
