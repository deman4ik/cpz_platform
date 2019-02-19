import {
  getClient,
  createSubscriptionsList,
  createSubscriptions
} from "./utils";

async function createSubs(args) {
  this.log("createSubs", args);
  this.log("Creating Event Grid subscriptions for environment", args.Env);
  const EGMClient = await getClient();
  this.log("Connected to Azure!");
  const subscriptions = createSubscriptionsList(args.Env, args.APIKey);
  /* this.log(
    "Subscriptions list",

    Object.keys(subscriptions).map(
      key => `${key}: ${subscriptions[key].map(sub => sub.name).join(", ")}`
    )
  ); */
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const key of Object.keys(subscriptions)) {
    const topicSubscriptions = subscriptions[key];
    this.log(
      `Creating "${key}" subscriptions`,
      topicSubscriptions.map(sub => sub.name).join(", ")
    );
    await createSubscriptions(EGMClient, topicSubscriptions);
  }
  /* no-restricted-syntax, no-await-in-loop */
}
export { createSubs };
