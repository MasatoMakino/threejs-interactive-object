module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["**/*.ts", "!**/__test__/**", "!**/bin/**"]
};
