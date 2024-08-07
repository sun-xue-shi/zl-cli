"use strict";

const path = require("path");
const { isObject } = require("@szl-cli-dev/utils");
const formatPath = require("@szl-cli-dev/format-path");
const pkgDir = require("pkg-dir").sync;

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("请传入初始化options!");
    }

    if (!isObject(options)) {
      throw new Error("初始化options类型错误! 应为Object!");
    }

    this.pkgName = options.packageName;
    this.targetPath = options.targetPath;
    this.pkgVersion = options.packageVersion;
  }

  exists() {}

  update() {}

  /**安装package */
  install() {}

  /**获取入口文件路径 */
  getRootFile() {
    //读取到给定路径下package.json所在的路径
    const dir = pkgDir(this.targetPath);
    console.log("dir", dir);
    if (dir) {
      //读取到package.json
      const pkgFile = require(path.resolve(dir, "package.json"));
      console.log("pkgFile", pkgFile.main);

      if (pkgFile && pkgFile.main) {
        console.log(path.resolve(dir, pkgFile.main));
        return formatPath(path.resolve(dir, pkgFile.main));
      }
      return null;
    }
  }
}

module.exports = Package;
