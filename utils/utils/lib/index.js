"use strict";

const { Spinner } = require("cli-spinner");
const childProcess = require("child_process");

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function cliSpinner(message = "loading", SspinnerString = "|/-\\") {
  const spinner = new Spinner(message + " %s");
  spinner.setSpinnerString(SspinnerString);
  spinner.start();

  return spinner;
}

function sleep(timeout = 2000) {
  return new Promise((res) => setTimeout(res, timeout));
}

/**
 * 兼容Windows
 */
function exec(command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;

  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

  return childProcess.spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on("error", (e) => {
      resolve(e);
    });

    p.on("exit", (e) => {
      resolve(e);
    });
  });
}

module.exports = {
  isObject,
  cliSpinner,
  sleep,
  exec,
  execAsync,
};
