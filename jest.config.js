module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testEnvironment: "jsdom",
  collectCoverageFrom: ["**/src/*.ts"],
};
