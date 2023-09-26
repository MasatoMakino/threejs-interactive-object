/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { useESM: true }],
  },
  testEnvironment: "jsdom",
  collectCoverageFrom: ["**/src/*.ts"],
};

export default jestConfig;
