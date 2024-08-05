"use strict";

module.exports = core;

const constant = require("./constant");
const pkg = require("../package.json");
const log = require("@szl-cli-dev/log");
const semver = require("semver");
const colors = require("colors");

function core() {
  try {
    checkVersion();
    checkNodeVersion();
  } catch (e) {
    log.error(e.message);
  }
}

/**
 * 检查当前包版本
 */
function checkVersion() {
  log.notice("cli", pkg.version);
}

/**
 * 检查node版本
 */
function checkNodeVersion() {
  const curNodeVersion = process.version;
  const minNodeVersion = constant.MIN_NODEVERSION_LIMIT;
  if (!semver.gte(curNodeVersion, minNodeVersion)) {
    throw new Error(colors.red(`请安装v${minNodeVersion}版本以上的Node`));
  }
}
