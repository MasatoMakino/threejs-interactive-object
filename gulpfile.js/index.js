"use strict";

const { series } = require("gulp");

const doc = require("gulptask-tsdoc").get();
const server = require("gulptask-dev-server").get("./docs/demo");
const { bundleDevelopment, watchBundle } = require("gulptask-webpack")(
  "./webpack.config.js"
);
const { tsc, tscClean, watchTsc } = require("gulptask-tsc").get();

const watchTasks = cb => {
  watchBundle();
  watchTsc();
  cb();
};

exports.start_dev = series(watchTasks, server);
exports.build = series(tsc, bundleDevelopment, doc);
exports.build_clean = series(tscClean, bundleDevelopment, doc);
