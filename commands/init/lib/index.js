"use strict";

const constant = require("./constant");
const Command = require("@szl-cli-dev/command");
const fs = require("fs");
const inquirer = require("inquirer");
const fse = require("fs-extra");
const log = require("@szl-cli-dev/log");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;
  }

  exec() {
    try {
      this.prepare();
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {
    const localPath = process.cwd();

    //判断当目录是否为空
    if (!this.isDirEmpty(localPath)) {
      let isContinue = false;
      if (!this.force) {
        //询问是否继续创建
        isContinue = (
          await inquirer.default.prompt({
            type: "confirm",
            name: "isContinue",
            default: false,
            message: "当前文件夹不为空,是否继续创建项目?",
          })
        ).isContinue;

        if (!isContinue) return;
      }

      //是否强制更新
      if (isContinue || this.force) {
        //询问是否清空当前目录下文件
        const { deleteFile } = await inquirer.default.prompt({
          type: "confirm",
          name: "deleteFile",
          default: false,
          message: "是否清空当前目录下的文件以创建项目?",
        });
        if (deleteFile) {
          //清空当前目录
          fse.emptyDirSync(localPath);
        }
      }
    }

    return await this.getProjectInfo();
  }

  async getProjectInfo() {
    const prijectInfo = {};
    const { type } = await inquirer.default.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化创建类型:",
      default: constant.PROJECT,
      choices: [
        {
          name: "项目",
          value: constant.PROJECT,
        },
        {
          name: "组件",
          value: constant.COMPONENT,
        },
      ],
    });
    console.log(type);
    if (type === constant.PROJECT) {
      const o = await inquirer.default.prompt([
        {
          type: "input",
          name: "projectName",
          default: this.projectName,
          message: "请输入项目名称",
        },
        {
          type: "input",
          name: "projectVersion",
          default: "",
          message: "请输入项目版本",
        },
      ]);
    } else if (type === constant.COMPONENT) {
    }

    return prijectInfo;
  }

  isDirEmpty(localPath) {
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
