import {
  getClient,
  createSubscriptionsList,
  createSubscriptions
} from "./utils";

async function createSubs(args) {
  this.log("createSubs", args);
  const ENVIRONMENT = args.environment;
  this.log("Creating Event Grid subscriptions for environment", ENVIRONMENT);
  const EGMClient = await getClient();
  this.log("Connected to Azure!");
  const subscriptions = createSubscriptionsList(ENVIRONMENT);
  this.log(
    "Subscriptions list",
    Object.keys(subscriptions).map(
      key => `${key}: ${subscriptions[key].map(sub => sub.name).join(", ")}`
    )
  );
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const key of Object.keys(subscriptions)) {
    const topicSubscriptions = subscriptions[key];
    this.log(`Creating "${key}" subscriptions...`);
    const result = await createSubscriptions(EGMClient, topicSubscriptions);
    this.log(result);
  }
  /* no-restricted-syntax, no-await-in-loop */
}
export { createSubs };
