import CCXTPrivateProvider from "./providers/ccxtPrivateProvider";

const connector = {};

async function getConnector(props) {
  const { userId, exchange } = props;
  const connectorName = `${exchange}_${userId}`;
  // Check if user uniq class exists
  if (!Object.prototype.hasOwnProperty.call(connector, connectorName)) {
    // if not - initializing new instance

    connector[connectorName] = new CCXTPrivateProvider(props);
    await connector[connectorName].init();
  }
  return connector[connectorName];
}

async function removeConnector(connectorName) {
  delete connector[connectorName];
}

export { getConnector, removeConnector };
