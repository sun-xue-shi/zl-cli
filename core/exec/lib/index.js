"use strict";

const path = require("path");
const Package = require("@szl-cli-dev/package");

const SETTINGS = {
  init: "echarts",
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

    if (pkg.exists()) {
      // pkg.update();
      console.log(true);
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

  console.log(await pkg.exists());

  const rootFile = pkg.getRootFile();

  // if (rootFile) {
  //   require(rootFile).apply(null, arguments);
  // }
}

module.exports = exec;
