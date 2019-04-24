module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  collectCoverage: true,
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  clearMocks: true,
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  moduleNameMapper: {
    cpz: "<rootDir>../cpz-shared"
  }
};
