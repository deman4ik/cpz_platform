module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  collectCoverage: true,
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
    cpz: "<rootDir>../cpz-shared"
  }
};
