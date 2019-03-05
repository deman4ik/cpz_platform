module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  // automock: true,
  moduleFileExtensions: ["js"],
  moduleNameMapper: {
    "^cpzConfig(.*)$": "<rootDir>../cpz-shared/config$1",
    cpzEnv: "<rootDir>../cpz-shared/config/environment",
    cpzDefaults: "<rootDir>../cpz-shared/config/defaults",
    cpzEventTypes: "<rootDir>../cpz-shared/config/events/types",
    cpzServices: "<rootDir>../cpz-shared/config/services",
    cpzState: "<rootDir>../cpz-shared/config/state",
    cpzStorageTables: "<rootDir>../cpz-shared/config/storageTables",
    cpzStorage: "<rootDir>../cpz-shared/tableStorage",
    cpzQueuesList: "<rootDir>../cpz-shared/config/queues",
    cpzQueue: "<rootDir>../cpz-shared/queueStorage",
    cpzEvents: "<rootDir>../cpz-shared/eventgrid",
    "^cpzUtils(.*)$": "<rootDir>../cpz-shared/utils$1",
    cpzDayjs: "<rootDir>../cpz-shared/utils/lib/dayjs",
    cpzDB: "<rootDir>../cpz-shared/db",
    cpzKeyVault: "<rootDir>../cpz-shared/keyVault/index.js",
    cpzLog: "<rootDir>../cpz-shared/log"
  }
};
