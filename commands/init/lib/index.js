"use strict";

function init(projectName, cmdOption) {
  console.log(1);
  console.log(
    "init",
    projectName,
    cmdOption.force,
    process.env.CLI_TARGET_PATH
  );
}

module.exports = init;
