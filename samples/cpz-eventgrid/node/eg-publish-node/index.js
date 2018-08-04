/* 
 * https://github.com/Azure-Samples/event-grid-node-publish-consume-events/tree/master/EventGridPublisher
 */

const dev = process.env.NODE_ENV !== "production";
if (dev) require("dotenv-safe").config(); // eslint-disable-line

const publish = require('./publisher');

const example = async () => {

    const result = await publish();
}

example();