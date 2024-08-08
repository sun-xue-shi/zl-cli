"use strict";

const Command = require("@szl-cli-dev/command");

class InitCommand extends Command {}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
