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

  EGConfig(topics) {
    return topics.map(topic => ({
      name: topic,
      endpoint: process.env[`EG_${topic.toUpperCase()}_ENDPOINT`],
      key: process.env[`EG_${topic.toUpperCase()}_KEY`]
    }));
  }
}

export default BaseService;
