"use strict";

const Package = require("@szl-cli-dev/package");

const SETTINGS = {
  init: "@szl-cli-dev/init",
};

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  const cmdOptions = arguments[arguments.length - 1];
  const cmdName = cmdOptions.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
  }

  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion,
  });
  pkg.getRootFile();
}

module.exports = exec;
