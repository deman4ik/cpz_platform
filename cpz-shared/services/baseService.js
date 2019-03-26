import checkAuth from "./middleware/checkAuth";
import handlingEventsByTypes from "./middleware/handlingEventsByTypes";

class BaseService {
  checkAuth(context, req) {
    return checkAuth(context, req);
  }

  handlingEventsByTypes(context, req, neededEvents) {
    return handlingEventsByTypes(context, req, neededEvents);
  }

  ValidatorConfig(schemasList) {
    let schema = {};
    schemasList.forEach(s => {
      schema = { ...schema, ...s };
    });
    return schema;
  }

  EGConfig(topics) {
    return Object.values(topics).map(topic => ({
      name: topic,
      endpoint: process.env[`EG_${topic.toUpperCase()}_ENDPOINT`],
      key: process.env[`EG_${topic.toUpperCase()}_KEY`]
    }));
  }
}

export default BaseService;
