import msRestAzure from "ms-rest-azure";
import EventGridManagementClient from "azure-arm-eventgrid";
import { checkEnvVars } from "cpzUtils/environment";
import dotenv from "dotenv-safe";
import {
  endpoints as eventEndpoints,
  topics
} from "cpzConfig/events/endpoints";

dotenv.config();
checkEnvVars([
  "MANAGE_APP_ID",
  "MANAGE_APP_KEY",
  "AD_DIRECTORY_ID",
  "SUBSRIPTION_ID",
  "RESOURSE_GROUP"
]);
const {
  MANAGE_APP_ID,
  MANAGE_APP_KEY,
  AD_DIRECTORY_ID,
  SUBSRIPTION_ID,
  RESOURSE_GROUP
} = process.env;

async function getClient() {
  const credentials = await msRestAzure.loginWithServicePrincipalSecret(
    MANAGE_APP_ID,
    MANAGE_APP_KEY,
    AD_DIRECTORY_ID
  );

  const EGMClient = new EventGridManagementClient(credentials, SUBSRIPTION_ID);
  return EGMClient;
}

async function createOrUpdateSub(
  EGMClient,
  topicName,
  subName,
  endpointUrl,
  eventTypes
) {
  const scope = `/subscriptions/${SUBSRIPTION_ID}/resourceGroups/${RESOURSE_GROUP}/providers/Microsoft.EventGrid/topics/${topicName}`;
  const properties = {
    destination: {
      endpointType: "WebHook",
      endpointUrl
    },
    filter: {
      includedEventTypes: eventTypes
    },
    eventDeliverySchema: "EventGridSchema"
  };
  const result = await EGMClient.eventSubscriptions.createOrUpdate(
    scope,
    subName,
    properties
  );
  return result;
}

async function deleteSub(EGMClient, topicName, subName) {
  const scope = `/subscriptions/${SUBSRIPTION_ID}/resourceGroups/${RESOURSE_GROUP}/providers/Microsoft.EventGrid/topics/${topicName}`;
  const result = await EGMClient.eventSubscriptions.deleteMethod(
    scope,
    subName
  );
  return result;
}

async function listSubs(EGMClient, topicName) {
  const list = await EGMClient.eventSubscriptions.listByResource(
    RESOURSE_GROUP,
    "Microsoft.EventGrid",
    "topics",
    topicName
  );
  const subs = [];
  if (list && list.length > 0) {
    list.forEach(element => {
      subs.push({
        name: element.name,
        url: element.destination.endpointBaseUrl,
        filter: element.filter,
        status: element.provisioningState
      });
    });
  }
  return subs;
}

/**
 * Create Subscription Endpoint Url
 *
 * @param {string} serviceName
 * @param {string} environment
 * @param {string} postfix
 * @param {string} apikey
 * @returns {string}
 */
const createEndpointUrl = (serviceName, environment, postfix, apikey) =>
  `https://cpz-${serviceName}-${environment}.azurewebsites.net${postfix}?api-key=${apikey}`;

/**
 * Create Event Grid Topic Name
 *
 * @param {string} topicName
 * @param {string} environment
 * @returns {string}
 */
const createTopicName = (topicName, environment) =>
  `cpz-${topicName}-${environment}`;

/**
 * Create Subscriptions List from global configuration
 *
 * @param {string} environment
 * @returns {Object}
 *
 * @example
 * { error: [{ name: 'eventslogger-error',
 *             topic: 'error',
 *             url: 'https://cpz-eventslogger-prod.azurewebsites.net/api/events',
 *             types: ["CPZ.Adviser.Error","CPZ.Backtester.Error"],
 *             topicName: 'cpz-error-prod' }]}
 */
function createSubscriptionsList(environment, apikey) {
  let allEndpoints = [];
  Object.keys(eventEndpoints).forEach(key => {
    allEndpoints = [
      ...new Set([
        ...eventEndpoints[key].map(endpoint => ({
          ...endpoint,
          topicName: createTopicName(endpoint.topic, environment),
          url: createEndpointUrl(key, environment, endpoint.url, apikey)
        })),
        ...allEndpoints
      ])
    ];
  });

  const endpoints = {};
  topics.forEach(topic => {
    endpoints[topic] = allEndpoints.filter(
      endpoint => endpoint.topic === topic
    );
  });
  return endpoints;
}

async function createSubscriptions(client, subscriptions) {
  try {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const subscription of subscriptions) {
      console.log(
        `Creating ${subscription.topicName} - ${subscription.name} sub to ${
          subscription.url
        }`
      );
      const result = await createOrUpdateSub(
        client,
        subscription.topicName,
        subscription.name,
        subscription.url
      );
      console.log(result);
    }
    /* no-restricted-syntax, no-await-in-loop  */
  } catch (error) {
    throw error;
  }
}

export {
  getClient,
  createSubscriptionsList,
  createSubscriptions,
  deleteSub,
  listSubs
};
