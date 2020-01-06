module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverageFrom: ["**/*.ts", "!**/__test__/**", "!**/bin/**"]
};
