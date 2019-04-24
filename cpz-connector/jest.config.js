module.exports = {
  verbose: true,
  reporters: ["default", "jest-junit"],
  // automock: true,
  moduleFileExtensions: ["js"],
  moduleNameMapper: {
    cpz: "<rootDir>../cpz-shared/"
  }
};
