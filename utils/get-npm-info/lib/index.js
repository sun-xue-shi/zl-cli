"use strict";

const axios = require("axios");
const semver = require("semver");
const urljoin = require("url-join");

/**
 * 拼接url获取npm信息
 */
function getNpmInfo(npmName, registry) {
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmUrl = urljoin(registryUrl, npmName);
  return axios.get(npmUrl).then((res) => {
    if (res.status === 200) {
      return res.data;
    }
    return null;
  });
}

/**
 *
 * @param {*} isOriginal 是否是npm原本的镜像
 * @returns npm镜像
 */
function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npmmirror.com";
}

/**
 *
 * @param {*} npmName
 * @param {*} registry
 * @returns 所有的版本
 */
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);

  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

/**
 * 获取比当前包的版本大的所有版本号
 * @param {*} baseVersion
 * @param {*} versions
 */
function getConditionVersion(baseVersion, versions = []) {
  const newVersions = versions.filter((version) =>
    semver.satisfies(version, `>=${baseVersion}`)
  );

  if (newVersions && newVersions.length > 0) {
    return newVersions[newVersions.length - 1];
  }
  return null;
}

/**
 *
 * @param {*} baseVersion
 * @param {*} npmName
 * @param {*} registry
 */
async function getLastNpmVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const lastVersion = getConditionVersion(baseVersion, versions);

  return lastVersion;
}

module.exports = { getNpmInfo, getNpmVersions, getLastNpmVersion };
