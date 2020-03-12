const { ValidationError, NotFoundError } = require("moleculer").Errors;
const { ForbiddenError, UnAuthorizedError } = require("moleculer-web").Errors;
const logdnaWinston = require("logdna-winston");

/**
 * Moleculer ServiceBroker configuration file
 *
 * More info about options: https://moleculer.services/docs/0.13/broker.html#Broker-options
 *
 * Overwrite options in production:
 * ================================
 * 	You can overwrite any option with environment variables.
 * 	For example to overwrite the "logLevel", use `LOGLEVEL=warn` env var.
 * 	To overwrite a nested parameter, e.g. retryPolicy.retries, use `RETRYPOLICY_RETRIES=10` env var.
 *
 * 	To overwrite broker’s deeply nested default options, which are not presented in "moleculer.config.ts",
 * 	via environment variables, use the `MOL_` prefix and double underscore `__` for nested properties in .env file.
 * 	For example, to set the cacher prefix to `MYCACHE`, you should declare an env var as `MOL_CACHER__OPTIONS__PREFIX=MYCACHE`.
 */
const brokerConfig = {
  // Namespace of nodes to segment your nodes on the same network.
  namespace: "cpz",
  // Unique node identifier. Must be unique in a namespace.
  nodeID: "cpz",

  logger: [
    {
      type: "Console",
      options: {
        // Logging level
        level: "info",
        // Folder path to save files. You can use {nodeID} & {namespace} variables.
        folder: "./logs",
        // Filename template. You can use {date}, {nodeID} & {namespace} variables.
        filename: "cpz-{namespace}-{nodeID}-{date}.log",
        // Line formatter. It can be "json", "short", "simple", "full", a `Function` or a template string like "{timestamp} {level} {nodeID}/{mod}: {msg}"
        formatter: "full",
        // Custom object printer. If not defined, it uses the `util.inspect` method.
        objectPrinter: null,
        // End of line. Default values comes from the OS settings.
        eol: "\n",
        // File appending interval in milliseconds.
        interval: 1 * 1000
      }
    },
    /* {
      type: "File",
      options: {
        // Logging level
        level: "info",
        // Folder path to save files. You can use {nodeID} & {namespace} variables.
        folder: "./logs",
        // Filename template. You can use {date}, {nodeID} & {namespace} variables.
        filename: "cpz-{namespace}-{nodeID}-{date}.log",
        // Line formatter. It can be "json", "short", "simple", "full", a `Function` or a template string like "{timestamp} {level} {nodeID}/{mod}: {msg}"
        formatter: "full",
        // Custom object printer. If not defined, it uses the `util.inspect` method.
        objectPrinter: null,
        // End of line. Default values comes from the OS settings.
        eol: "\n",
        // File appending interval in milliseconds.
        interval: 1 * 1000
      }
    },*/
    {
      type: "Winston",
      options: {
        // Logging level
        level: "info",
        winston: {
          // More settings: https://github.com/winstonjs/winston#creating-your-own-logger
          transports: [
            new logdnaWinston({
              key: process.env.LOGDNA_KEY, // the only field required
              app: process.env.NODEID,
              env: process.env.NAMESPACE,
              index_meta: true // Defaults to false, when true ensures meta object will be searchable
            })
          ]
        }
      }
    }
  ],

  tracing: {
    enabled: false,
    exporter: {
      type: "Event",
      options: {
        // Name of event
        eventName: "trace-logger.spans",
        // Send event when a span started
        sendStartSpan: false,
        // Send event when a span finished
        sendFinishSpan: true,
        // Broadcast or emit event
        broadcast: false,
        // Event groups
        groups: null,
        // Sending time interval in seconds
        interval: 5,
        // Custom span object converter before sending
        spanConverter: null,
        // Default tags. They will be added into all span tags.
        defaultTags: registry => ({
          namespace: registry.broker.namespace,
          nodeID: registry.broker.nodeID
        })
      }
    },
    events: true,
    stackTrace: true
  },

  // Define transporter.
  // More info: https://moleculer.services/docs/0.13/networking.html
  transporter: {
    type: "Redis",
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS && {},
      db: 1
    }
  },

  // Define a cacher. More info: https://moleculer.services/docs/0.13/caching.html
  cacher: false,

  // Define a serializer.
  // Available values: "JSON", "Avro", "ProtoBuf", "MsgPack", "Notepack", "Thrift".
  // More info: https://moleculer.services/docs/0.13/networking.html
  serializer: "JSON",

  // Number of milliseconds to wait before reject a request with a RequestTimeout error. Disabled: 0
  requestTimeout: 120 * 1000,

  // Retry policy settings. More info: https://moleculer.services/docs/0.13/fault-tolerance.html#Retry
  retryPolicy: {
    // Enable feature
    enabled: true,
    // Count of retries
    retries: 10,
    // First delay in milliseconds.
    delay: 100,
    // Maximum delay in milliseconds.
    maxDelay: 1000,
    // Backoff factor for delay. 2 means exponential backoff.
    factor: 2,
    // A function to check failed requests.
    check: err => err && !!err.retryable
  },

  // Limit of calling level. If it reaches the limit, broker will throw an MaxCallLevelError error. (Infinite loop protection)
  maxCallLevel: 100,

  // Number of seconds to send heartbeat packet to other nodes.
  heartbeatInterval: 5,
  // Number of seconds to wait before setting node to unavailable status.
  heartbeatTimeout: 15,

  // Tracking requests and waiting for running requests before shutdowning. More info: https://moleculer.services/docs/0.13/fault-tolerance.html
  tracking: {
    // Enable feature
    enabled: true,
    // Number of milliseconds to wait before shutdowning the process
    shutdownTimeout: 5000
  },

  // Disable built-in request & emit balancer. (Transporter must support it, as well.)
  disableBalancer: false,

  // Settings of Service Registry. More info: https://moleculer.services/docs/0.13/registry.html
  registry: {
    // Define balancing strategy.
    // Available values: "RoundRobin", "Random", "CpuUsage", "Latency"
    strategy: "RoundRobin",
    // Enable local action call preferring.
    preferLocal: true
  },

  // Settings of Circuit Breaker. More info: https://moleculer.services/docs/0.13/fault-tolerance.html#Circuit-Breaker
  circuitBreaker: {
    // Enable feature
    enabled: true,
    // Threshold value. 0.5 means that 50% should be failed for tripping.
    threshold: 0.5,
    // Minimum request count. Below it, CB does not trip.
    minRequestCount: 20,
    // Number of seconds for time window.
    windowTime: 60,
    // Number of milliseconds to switch from open to half-open state
    halfOpenTime: 10 * 1000,
    // A function to check failed requests.
    check: err => err && err.code >= 500
  },

  // Settings of bulkhead feature. More info: https://moleculer.services/docs/0.13/fault-tolerance.html#Bulkhead
  bulkhead: {
    // Enable feature.
    enabled: false,
    // Maximum concurrent executions.
    concurrency: 10,
    // Maximum size of queue
    maxQueueSize: 100
  },

  // Custom Validator class for validation.
  validator: true,

  // Enable metrics function. More info: https://moleculer.services/docs/0.13/metrics.html
  metrics: {
    enabled: false,
    reporter: {
      type: "Event",
      options: {
        includes: [
          "moleculer.request.error.total",
          "os.memory.free",
          "process.eventloop.lag.avg"
        ],
        // Event name
        eventName: "trace-logger.metrics",
        // Broadcast or emit
        broadcast: false,
        // Event groups
        groups: null,
        // Send only changed metrics
        onlyChanges: true,
        // Sending interval in seconds
        interval: 60 * 30,

        defaultLabels: registry => ({
          namespace: registry.broker.namespace,
          nodeID: registry.broker.nodeID
        })
      }
    }
  },

  // Register internal services ("$node"). More info: https://moleculer.services/docs/0.13/services.html#Internal-services
  internalServices: true,
  // Register internal middlewares. More info: https://moleculer.services/docs/0.13/middlewares.html#Internal-middlewares
  internalMiddlewares: true,

  // Watch the loaded services and hot reload if they changed. You can also enable it in Moleculer Runner with `--hot` argument
  hotReload: false,

  // Register custom middlewares
  middlewares: [],

  // Called after broker created.
  created(broker) {},

  // Called after broker starte.
  started(broker) {},

  // Called after broker stopped.
  stopped(broker) {},

  // Register custom REPL commands.
  replCommands: null
};

module.exports = brokerConfig;
