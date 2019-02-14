module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  collectCoverage: true,
  coverageReporters: ["text", "cobertura", "html"],
  projects: ["<rootDir>/cpz-adviser", "<rootDir>/cpz-shared"],
  testEnvironment: "node"
};
