"use strict";

const path = require("path");

/**
 * 路径兼容处理
 * @param {*} filePath 文件路径
 */
function formatPath(filePath) {
  if (filePath && typeof filePath === "string") {
    if (path.sep === "/") {
      return filePath;
    } else {
      return filePath.replace(/\\/g, "/");
    }
  }
}

module.exports = formatPath;
