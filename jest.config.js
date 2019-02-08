module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  collectCoverage: true,
  projects: ["<rootDir>/cpz-adviser", "<rootDir>/cpz-shared"],
  testEnvironment: "node"
};
