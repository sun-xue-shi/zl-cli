const CREATE_TYPE = {
  COMPONENT: "component",
  PROJECT: "project",
};

const TEMPLATE_TYPE = {
  CUSTOM: "custom",
  NORMAL: "normal",
};

const WHITE_COMMAND = ["npm", "cnpm", "pnpm", "yarn"];

const IGNORE_PATH = ["node_modules/**", "public/**", "package-lock.json"];

module.exports = {
  CREATE_TYPE,
  TEMPLATE_TYPE,
  WHITE_COMMAND,
  IGNORE_PATH,
};
