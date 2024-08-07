const os = require("os");

const MIN_NODEVERSION_LIMIT = "16.0.0";
const USER_HOME = os.homedir();
const DEFAULT_CLI_HOME = "szl-cli-dev";

module.exports = {
  MIN_NODEVERSION_LIMIT,
  USER_HOME,
  DEFAULT_CLI_HOME,
};
