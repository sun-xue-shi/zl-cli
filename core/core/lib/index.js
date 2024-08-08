"use strict";

module.exports = core;

const constant = require("./constant");
const pkg = require("../package.json");
const log = require("@szl-cli-dev/log");
const init = require("@szl-cli-dev/init");
const exec = require("@szl-cli-dev/exec");
const { Command } = require("commander");
const { getLastNpmVersion } = require("@szl-cli-dev/get-npm-info");
const semver = require("semver");
const pathExists = require("path-exists").sync;
const colors = require("colors");
const path = require("path");

async function core() {
  try {
    await prepare();
    registerCommander();
  } catch (e) {
    log.error(e.message);
  }
}

async function prepare() {
  checkVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

/**
 * 注册命令
 */
function registerCommander() {
  const program = new Command();

  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "start debug mode?", false)
    .option("-tp, --targetPath <targetPath>", "指定本地调试路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目", false)
    .action(exec);

  //监听debug模式
  program.on("option:debug", () => {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose("test");
  });

  //监听调试路径
  program.on("option:targetPath", () => {
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });

  //监听未知命令
  program.on("command:*", (cmds) => {
    const commands = program.commands.map((item) => item.name());

    log.error(colors.red("unknow command:" + cmds[0]));
    if (commands.length > 0) {
      log.notice(
        colors.blue("All commands can be used are:" + commands.join(","))
      );
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
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
  createDefaultEnv();
}

/**
 * 创建默认环境配置
 */
function createDefaultEnv() {
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
  console.log("cliConfig.cliHome", cliConfig.cliHome);

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
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
