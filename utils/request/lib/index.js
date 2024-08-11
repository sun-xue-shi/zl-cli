"use strict";

const axios = require("axios");

const BASE_URL = process.env.ZL_BASE_URL
  ? process.env.ZL_BASE_URL
  : "http://127.0.0.1:7001/";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    return Promise.reject(err);
  }
);

module.exports = request;
