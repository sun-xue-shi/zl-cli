"use strict";

const constant = require("./constant");
const semver = require("semver");
const colors = require("colors");

class Command {
  constructor(argv) {
    console.log("init command");
    this.argv = argv;
    let runner = new Promise((resolve, reject) => {
      Promise.resolve().then(() => {
        this.checkNodeVersion();
      });
    });
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
