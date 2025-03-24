const mongoose = require('mongoose');
const config = require('../../config');
const initAdmin = require('./admin');
const initDictData = require('./dictData');

async function init() {
  try {
    // 连接数据库
    await mongoose.connect(config.mongodb.url, config.mongodb.options);
    console.log('数据库连接成功');

    // 初始化管理员账号
    await initAdmin();

    // 初始化字典数据
    await initDictData();

    console.log('所有初始化任务完成');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

init(); 