const path = require('path');

// 根据环境加载对应的配置文件
require('dotenv').config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
});

// 数据库配置
const mongodb = require('./mongodb');
const jwt = require('./jwt');
const server = require('./server');
const logging = require('./logging');
const cors = require('./cors');

const config = {
  env: process.env.NODE_ENV || 'development',
  ...server,
  mongodb,
  jwt,
  logging,
  cors
};

module.exports = config; 