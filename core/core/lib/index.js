"use strict";

module.exports = core;

const pkg = require("../package.json");
const log = require("@szl-cli-dev/log");

function core() {
  checkVersion();
}

function checkVersion() {
  log.notice("cli", pkg.version);
}
