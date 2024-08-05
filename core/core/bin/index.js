#! /usr/bin/env node

const importlocal = require("import-local");

if (importlocal(__filename)) {
  require("npmlog").info("cli", "本地");
} else {
  require("../lib")(process.argv.slice(2));
}
