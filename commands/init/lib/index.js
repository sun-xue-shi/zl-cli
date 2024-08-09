"use strict";

const Command = require("@szl-cli-dev/command");

class InitCommand extends Command {
  init() {
    console.log(this._cmd);

    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;
    console.log(this.projectName, this.force);
  }

  exec() {}
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
