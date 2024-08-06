"use strict";

module.exports = core;

const constant = require("./constant");
const pkg = require("../package.json");
const log = require("@szl-cli-dev/log");
const { getLastNpmVersion } = require("@szl-cli-dev/get-npm-info");
const semver = require("semver");
const pathExists = require("path-exists");
const colors = require("colors");
const path = require("path");

async function core() {
  try {
    checkVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArg();
    checkEnv();
    await checkGlobalUpdate();
    log.verbose("debug", "test-debug");
  } catch (e) {
    log.error(e.message);
  }
}

/**
 * 检查提示全局更新
 */
async function checkGlobalUpdate() {
  const curNpmVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await getLastNpmVersion(curNpmVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, curNpmVersion)) {
    log.warn(
      colors.yellow(
        `should update ${npmName} version ${curNpmVersion} --> ${lastVersion}`
      )
    );
    log.warn(colors.yellow(`You can run: npm i -g ${npmName}`));
  }
}

/**
 * 检查环境变量
 */
function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(constant.USER_HOME, ".env");
  if (pathExists(dotenvPath)) {
    // 把.env的环境变量放在process.env里
    dotenv.config({
      path: dotenvPath,
    });
  }
  createEnv();
  log.verbose("env", process.env.CLI_HOME_PATH);
}

/**
 * 创建默认环境配置
 */
function createEnv() {
  const cliConfig = {
    cliHome: constant.USER_HOME,
  };

  if (process.env.CLI_HOME) {
    console.log("process.env.CLI_HOME", process.env.CLI_HOME);

    cliConfig["cliHome"] = path.join(constant.USER_HOME, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(
      constant.USER_HOME,
      constant.DEFAULT_CLI_HOME
    );
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

/**
 * 检查入参
 */
function checkInputArg() {
  const minimist = require("minimist");
  const args = minimist(process.argv.slice(2));
  console.log(args);

  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
  console.log(process.env.LOG_LEVEL);
}

/**
 * 检查用户主目录
 */
function checkUserHome() {
  const userHome = constant.USER_HOME;
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
