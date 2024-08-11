"use strict";

const path = require("path");
const os = require("os");
const constant = require("./constant");
const getTemplate = require("./getTemplate");
const Command = require("@szl-cli-dev/command");
const Package = require("@szl-cli-dev/package");
const { cliSpinner, sleep } = require("@szl-cli-dev/utils");
const fs = require("fs");
const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");
const log = require("@szl-cli-dev/log");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();

      if (projectInfo) {
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate
    );
    const userHome = os.homedir();

    const targetPath = path.resolve(userHome, "szl-cli-dev", "template");
    const storePath = path.resolve(
      userHome,
      "szl-cli-dev",
      "template",
      "node_modules"
    );

    const templateNpm = new Package({
      packageName: templateInfo.npmName,
      packageVersion: templateInfo.version,
      targetPath,
      storePath,
    });

    if (!(await templateNpm.exists())) {
      const spinner = cliSpinner();
      try {
        await templateNpm.install();
        await sleep();
        log.success("下载成功");
      } catch (error) {
        throw new Error(error.message);
      } finally {
        spinner.stop(true);
      }
    } else {
      const spinner = cliSpinner("update...");

      try {
        await templateNpm.update();
        await sleep();
        log.success("更新成功");
      } catch (error) {
        throw new Error(error.message);
      } finally {
        spinner.stop(true);
      }
    }
  }

  async prepare() {
    const template = await getTemplate();
    console.log("template", template);
    if (!template || template.length === 0) {
      throw new Error("当前模版为空!");
    } else {
      this.template = template;
    }

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
    let projectInfo = {};
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

    if (type === constant.PROJECT) {
      const info = await inquirer.default.prompt([
        {
          type: "input",
          name: "projectName",
          default: this.projectName,
          message: "请输入项目名称",
        },
        {
          type: "input",
          name: "projectVersion",
          default: "1.0.0",
          message: "请输入项目版本",
          validate: (version) => {
            return !!semver.valid(version);
          },
        },
        {
          type: "list",
          name: "projectTemplate",
          default: "",
          message: "请选择项目模版",
          choices: this.template.map((item) => ({
            name: item.name,
            value: item.npmName,
          })),
        },
      ]);

      projectInfo = {
        type,
        ...info,
      };
    } else if (type === constant.COMPONENT) {
    }

    return projectInfo;
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
