"use strict";

module.exports = core;

const constant = require("./constant");
const pkg = require("../package.json");
const log = require("@szl-cli-dev/log");
const semver = require("semver");
const os = require("os");
const pathExists = require("path-exists");
const colors = require("colors");

function core() {
  try {
    checkVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (e) {
    log.error(e.message);
  }
}

/**
 * 检查用户主目录
 */
function checkUserHome() {
  const userHome = os.homedir();
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}

/**
 * root降级处理
 */
function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
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
