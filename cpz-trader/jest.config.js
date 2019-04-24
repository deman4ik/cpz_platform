module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
    cpz: "<rootDir>../cpz-shared"
  }
};
