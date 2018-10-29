module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!<rootDir>/__test__/",
    "!<rootDir>/docs/api/",
    "!<rootDir>/task/",
  ]
};
