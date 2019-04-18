import CCXTPublicProvider from "./providers/ccxtPublicProvider";
import CCXTPrivateProvider from "./providers/ccxtPrivateProvider";

const publicConnectors = {};
const privateConnectors = {};

async function getPublicConnector(props) {
  const { exchange } = props;
  const connectorName = exchange;
  // Check if user uniq class exists
  if (!Object.prototype.hasOwnProperty.call(publicConnectors, connectorName)) {
    // if not - initializing new instance

    publicConnectors[connectorName] = new CCXTPublicProvider(props);
    await publicConnectors[connectorName].init();
  }
  return publicConnectors[connectorName];
}

async function removePublicConnector(connectorName) {
  delete publicConnectors[connectorName];
}

async function getPrivateConnector(props) {
  const { userId, exchange } = props;
  const connectorName = `${exchange}_${userId}`;
  // Check if user uniq class exists
  if (!Object.prototype.hasOwnProperty.call(privateConnectors, connectorName)) {
    // if not - initializing new instance

    privateConnectors[connectorName] = new CCXTPrivateProvider(props);
    await privateConnectors[connectorName].init();
  }
  return privateConnectors[connectorName];
}

async function removePrivateConnector(connectorName) {
  delete privateConnectors[connectorName];
}

export {
  getPublicConnector,
  removePublicConnector,
  getPrivateConnector,
  removePrivateConnector
};
