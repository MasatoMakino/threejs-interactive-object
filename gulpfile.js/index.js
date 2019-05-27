"use strict";

const { series } = require("gulp");

const doc = require("gulptask-tsdoc")();
exports.doc = doc;
const server = require("gulptask-dev-server")("./docs");
exports.server = server;
const { bundleDevelopment, watchBundle } = require("gulptask-webpack")(
  "./webpack.config.js"
);
exports.bundleDevelopment = bundleDevelopment;
const { tsc, watchTsc } = require("gulptask-tsc")();
exports.tsc = tsc;

const watchTasks = cb => {
  watchBundle();
  watchTsc();
  cb();
};

exports.start_dev = series(watchTasks, server);
exports.build = series(tsc, bundleDevelopment, doc);
