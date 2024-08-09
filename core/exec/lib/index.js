"use strict";

const childProcess = require("child_process");
const path = require("path");
const Package = require("@szl-cli-dev/package");
const log = require("@szl-cli-dev/log");

const SETTINGS = {
  init: "@imooc-cli/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storePath = "";
  let pkg;

  const cmdOptions = arguments[arguments.length - 1];
  const cmdName = cmdOptions.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storePath = path.resolve(targetPath, "node_modules");

    pkg = new Package({
      targetPath,
      storePath,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      await pkg.update();
    } else {
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFile();

  if (rootFile) {
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];

      const o = Object.create(null);

      Object.keys(cmd).forEach((k) => {
        if (
          !k.startsWith("_") &&
          k !== "parent" &&
          k !== "registeredArguments" &&
          cmd.hasOwnProperty(k)
        ) {
          o[k] = cmd[k];
        }
      });

      args[args.length - 1] = o;

      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;

      const child = childProcess.spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });

      child.on("error", (e) => {
        process.exit(1);
      });

      child.on("exit", (e) => {
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    }
  }
}

/**
 * 兼容Windows
 */
// function spawn(command, args, options) {
//   const win32 = process.platform === "win32";
//   const cmd = win32 ? "win32" : command;

//   const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

//   return childProcess.spawn(cmd, cmdArgs, options);
// }

module.exports = exec;
