"use strict";

const path = require("path");
const Package = require("@szl-cli-dev/package");

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
  const packageVersion = "1.1.0";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storePath = path.resolve(targetPath, "node_modules\\.store");

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

  // if (rootFile) {
  //   require(rootFile).apply(null, arguments);
  // }
}

module.exports = exec;
