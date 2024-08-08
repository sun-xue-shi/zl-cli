"use strict";

const path = require("path");
const { isObject } = require("@szl-cli-dev/utils");
const formatPath = require("@szl-cli-dev/format-path");
const {
  getDefaultRegistry,
  getLatestVersion,
} = require("@szl-cli-dev/get-npm-info");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");
const pathExists = require("path-exists");
const fse = require("fs-extra");

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
    this.storePath = options.storePath;
    this.pkgVersion = options.packageVersion;
    this.cacheFilePathPerfix = this.pkgName.replace("/", "+");
  }

  getCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `.store\\${this.cacheFilePathPerfix}@${packageVersion}`
    );
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      fse.mkdirSync(this.storePath);
    }
    if (this.pkgVersion === "latest") {
      this.pkgVersion = await getLatestVersion(this.pkgName);
    }
  }

  async exists() {
    if (this.storePath) {
      await this.prepare();

      const cacheFilePath = path.resolve(
        this.storePath,
        `.store\\${this.cacheFilePathPerfix}@${this.pkgVersion}`
      );

      return await pathExists(cacheFilePath);
    } else {
      return await pathExists(this.targetPath);
    }
  }

  async update() {
    await this.prepare();
    const latestVersion = await getLatestVersion(this.pkgName);
    const latestFilePath = this.getCacheFilePath(latestVersion);

    if (!(await pathExists(latestFilePath))) {
      await npminstall({
        root: this.targetPath,
        pkgs: [{ name: this.pkgName, version: latestVersion }],
        registry: getDefaultRegistry(),
      });
      this.pkgVersion = latestVersion;
    }
  }

  /**安装package */
  async install() {
    await this.prepare();

    return npminstall({
      root: this.targetPath,
      pkgs: [{ name: this.pkgName, version: this.pkgVersion }],
      registry: getDefaultRegistry(),
    });
  }

  /**获取入口文件路径 */
  getRootFile() {
    function _getRootFile(filePath) {
      //读取到给定路径下package.json所在的路径
      const dir = pkgDir(filePath);

      if (dir) {
        //读取到package.json
        const pkgFile = require(path.resolve(dir, "package.json"));

        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
    if (this.storePath) {
      return _getRootFile(path.resolve(this.storePath, `${this.pkgName}`));
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
