"use strict";

const { dest, series, src, watch } = require("gulp");

const doc = require("gulptask-tsdoc").get();
const server = require("gulptask-dev-server").get("./docs/demo");

const { bundleDemo, watchDemo } = require("gulptask-demo-page").get({
  externalScripts: [],
  body: `<canvas id="webgl-canvas"></canvas>`
});

const { tsc, tscClean, watchTsc } = require("gulptask-tsc").get();

const watchTasks = async () => {
  watchDemo();
  watchTsc();
};

exports.start_dev = series(watchTasks, server);
exports.build = series(tsc, bundleDemo, doc);
exports.build_clean = series(tscClean, bundleDemo, doc);
