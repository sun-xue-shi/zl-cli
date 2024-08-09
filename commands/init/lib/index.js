"use strict";

const Command = require("@szl-cli-dev/command");
const fs = require("fs");
const log = require("@szl-cli-dev/log");

class InitCommand extends Command {
  init() {
    console.log(this._cmd);

    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;
    console.log(this.projectName, this.force);
  }

  exec() {
    try {
      this.prepare();
    } catch (e) {
      log.error(e.message);
    }
  }

  prepare() {
    //判断当目录是否为空
    if (!this.isDirEmpty()) {
      //询问是否继续创建
    } else {
    }
  }

  isDirEmpty() {
    const localPath = process.cwd();

    let fileList = fs.readdirSync(localPath);

    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );

    return !!fileList && fileList.length <= 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
