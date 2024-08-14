"use strict";

const path = require("path");
const os = require("os");
const {
  CREATE_TYPE,
  TEMPLATE_TYPE,
  WHITE_COMMAND,
  IGNORE_PATH,
} = require("./constant");
const getTemplate = require("./getTemplate");
const Command = require("@szl-cli-dev/command");
const Package = require("@szl-cli-dev/package");
const log = require("@szl-cli-dev/log");
const { cliSpinner, sleep, execAsync } = require("@szl-cli-dev/utils");
const fs = require("fs");
const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");
const kebabCase = require("kebab-case");
const { glob } = require("glob");
const ejs = require("ejs");

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
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  /**
   * 安装模板
   */
  async installTemplate() {
    if (!this.templateInfo) {
      throw new Error("未选择项目模版信息!");
    }
    if (!this.templateInfo.type) {
      this.templateInfo.type = TEMPLATE_TYPE.NORMAL;
    }

    if (this.templateInfo.type === TEMPLATE_TYPE.NORMAL) {
      await this.installNormalTemplate();
    } else if (this.templateInfo.type === TEMPLATE_TYPE.CUSTOM) {
      await this.installCustomTemplate();
    } else {
      throw new Error("无法识别项目模版类型!");
    }
  }

  /**
   * 白名单命令检测
   */
  checkWhiteCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

  /**
   * 执行命令
   * @param {*} cmd
   * @returns 执行结果
   */
  async execCommand(cmd, msg) {
    if (cmd) {
      const cmdArr = cmd.split(" ");

      const execCmd = this.checkWhiteCommand(cmdArr[0]);
      if (!execCmd) {
        throw new Error("命令不存在" + execCmd);
      }
      const args = cmdArr.slice(1);
      const res = await execAsync(execCmd, args, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      if (res !== 0) {
        throw new Error(msg);
      }
      return res;
    }
  }

  /**
   * ejs模版渲染
   */
  ejsRender() {
    const dir = process.cwd();
    return new Promise(async (reslove, reject) => {
      const files = await glob("**", {
        cwd: dir,
        ignore: IGNORE_PATH,
        nodir: true,
      });

      Promise.all(
        files.map((file) => {
          const filePath = path.join(dir, file);

          return new Promise((res, rej) => {
            ejs.renderFile(filePath, this.projectInfo, {}, (err, result) => {
              if (err) {
                rej(err);
              } else {
                fse.writeFileSync(filePath, result);
                reslove(res);
              }
            });
          });
        })
      )
        .then(() => {
          reslove();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 安装普通模版
   */
  async installNormalTemplate() {
    const spinner = cliSpinner();
    await sleep();
    try {
      const templatePath = path.resolve(
        this.templateNpm.storePath,
        this.templateNpm.pkgName,
        "template"
      );
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
      log.success("安装成功！");
    }

    const res = await this.ejsRender();

    const { installCommand, startCommand } = this.templateInfo;

    await this.execCommand(installCommand, "依赖安装失败");

    await this.execCommand(startCommand, "启动失败");
  }

  /**
   * 安装自定义模版
   */
  async installCustomTemplate() {
    if (await this.templateNpm.exists()) {
      const rootFile = this.templateNpm.getRootFile();
      if (fs.existsSync(rootFile)) {
        log.notice("开始执行");

        const options = {
          ...this.templateInfo,
          cwd: process.cwd(),
        };

        const code = `require('${rootFile}')(${JSON.stringify(options)})`;
        await execAsync("node", ["-e", code], {
          stdio: "inherit",
          cwd: process.cwd(),
        });
      } else {
        throw new Error("自定义模版入口文件不存在");
      }
    }
  }

  /**
   * 下载/更新模版
   */
  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo;

    const userHome = os.homedir();

    const targetPath = path.resolve(userHome, "szl-cli-dev", "template");

    this.storePath = path.resolve(
      userHome,
      "szl-cli-dev",
      "template",
      "node_modules"
    );

    this.templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate
    );

    const templateNpm = new Package({
      packageName: this.templateInfo.npmName,
      packageVersion: this.templateInfo.version,
      targetPath,
      storePath: this.storePath,
    });

    if (!(await templateNpm.exists())) {
      const spinner = cliSpinner();
      try {
        await templateNpm.install();
        await sleep();
        this.templateNpm = templateNpm;
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
        this.templateNpm = templateNpm;
      } catch (error) {
        console.log("55");

        throw new Error(error.message);
      } finally {
        spinner.stop(true);
      }
    }
  }

  async prepare() {
    const template = await getTemplate();

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
      default: CREATE_TYPE.PROJECT,
      choices: [
        {
          name: "项目",
          value: CREATE_TYPE.PROJECT,
        },
        {
          name: "组件",
          value: CREATE_TYPE.COMPONENT,
        },
      ],
    });

    if (type === CREATE_TYPE.PROJECT) {
      const projectPrompt = [];
      if (!this.projectName) {
        projectPrompt.push({
          type: "input",
          name: "projectName",
          default: this.projectName,
          message: "请输入项目名称",
        });
      }
      const elsePrompt = [
        {
          type: "input",
          name: "version",
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
      ];

      projectPrompt.push(...elsePrompt);

      const info = await inquirer.default.prompt(projectPrompt);

      projectInfo = {
        type,
        ...info,
      };
    } else if (type === CREATE_TYPE.COMPONENT) {
    }

    if (projectInfo.projectName) {
      projectInfo.className = kebabCase(projectInfo.projectName).replace(
        /^-/,
        ""
      );
    } else if (this.projectName && !projectInfo.projectName) {
      projectInfo.projectName = this.projectName;
      projectInfo.className = kebabCase(projectInfo.projectName).replace(
        /^-/,
        ""
      );
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
