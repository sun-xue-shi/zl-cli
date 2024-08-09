"use strict";

const log = require("@szl-cli-dev/log");
const constant = require("./constant");
const semver = require("semver");
const colors = require("colors");

class Command {
  constructor(argv) {
    console.log("argv", argv);

    if (!argv) {
      throw new Error("参数不能为空!");
    }
    if (!Array.isArray(argv)) {
      throw new Error("参数必须为数组");
    }
    if (argv.length < 1) {
      throw new Error("参数列表为空!");
    }

    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => {
          this.checkNodeVersion();
        })
        .then(() => {
          this.initArgs();
        })
        .then(() => this.init())
        .then(() => this.exec())
        .catch((e) => {
          log.error(colors.red(e));
        });
    });
  }

  /**
   * 参数初始化
   */
  initArgs() {
    this._cmd = this._argv[1];
  }

  /**
   * 检查node版本
   */
  checkNodeVersion() {
    const curNodeVersion = process.version;
    const minNodeVersion = constant.MIN_NODEVERSION_LIMIT;
    if (!semver.gte(curNodeVersion, minNodeVersion)) {
      throw new Error(colors.red(`请安装v${minNodeVersion}版本以上的Node`));
    }
  }

  init() {
    throw new Error("请提供init方法");
  }

  exec() {
    throw new Error("请提供exec方法");
  }
}

module.exports = Command;
