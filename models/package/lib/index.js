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
    this.cacheFilePathPerfix = this.pkgName.replace("/", "_");
  }

  getCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPerfix}@${packageVersion}@${this.pkgName}`
    );
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      console.log(5454);

      fse.mkdirSync(this.storePath);
    }
    if (this.pkgVersion === "latest") {
      this.pkgVersion = await getLatestVersion(this.pkgName);
    }
  }

  async exists() {
    if (this.storePath) {
      // console.log("11", await pathExists(this.storePath));

      await this.prepare();

      const cacheFilePath = path.resolve(
        this.storePath,
        `_${this.cacheFilePathPerfix}@${this.pkgVersion}@${this.pkgName}`
      );

      // console.log("22", await pathExists(cacheFilePath));

      return await pathExists(cacheFilePath);
    } else {
      return await pathExists(this.targetPath);
    }
  }

  async update() {
    await this.prepare();
    const latestVersion = await getLatestVersion(this.pkgName);
    const latestFilePath = this.getCacheFilePath(latestVersion);
    if (!pathExists(latestFilePath)) {
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
      // targetDir: '/home/admin/.global/lib',
      // link bin to specific directory (for global install)
      // binDir: '/home/admin/.global/bin',
      registry: getDefaultRegistry(),
      // debug: false,
      // storeDir: root + 'node_modules',
      // ignoreScripts: true, // ignore pre/post install scripts, default is `false`
      // forbiddenLicenses: forbit install packages which used these licenses
    });
  }

  /**获取入口文件路径 */
  getRootFile() {
    //读取到给定路径下package.json所在的路径
    const dir = pkgDir(this.targetPath);
    if (dir) {
      //读取到package.json
      const pkgFile = require(path.resolve(dir, "package.json"));
      if (pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main));
      }
      return null;
    }
  }
}

module.exports = Package;
