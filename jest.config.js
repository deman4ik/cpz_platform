module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  projects: ["<rootDir>/cpz-adviser", "<rootDir>/cpz-shared"],
  testEnvironment: "node"
};
