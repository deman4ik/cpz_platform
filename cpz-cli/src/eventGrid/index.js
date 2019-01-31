const msRestAzure = require("ms-rest-azure");
const EventGridManagementClient = require("azure-arm-eventgrid");

const {
  MANAGE_APP_ID,
  MANAGE_APP_KEY,
  AD_DIRECTORY_ID,
  SUBSRIPTION_ID,
  RESOURSE_GROUP
} = process.env;
if (!MANAGE_APP_ID) throw new Error("MANAGE_APP_ID ENV REQUIRED!");
if (!MANAGE_APP_KEY) throw new Error("MANAGE_APP_KEY ENV REQUIRED!");
if (!AD_DIRECTORY_ID) throw new Error("AD_DIRECTORY_ID ENV REQUIRED!");
if (!SUBSRIPTION_ID) throw new Error("SUBSRIPTION_ID ENV REQUIRED!");
if (!RESOURSE_GROUP) throw new Error("RESOURSE_GROUP ENV REQUIRED!");

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

module.exports = { getClient, createOrUpdateSub, deleteSub, listSubs };
