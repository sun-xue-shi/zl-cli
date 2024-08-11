"use strict";

const { Spinner } = require("cli-spinner");

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

module.exports = {
  isObject,
  cliSpinner,
  sleep,
};
